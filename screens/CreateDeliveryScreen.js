import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import CustomAlert from '../components/ui/CustomAlert';
import api from '../services/api';

export default function CreateDeliveryScreen() {
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [fullSent, setFullSent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertType, setCustomAlertType] = useState('success');
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');

  const displayCustomAlert = (type, title, message) => {
    setCustomAlertType(type);
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setShowCustomAlert(true);
  };

  const handleDismissAlert = () => {
    setShowCustomAlert(false);
  };

  const fetchData = async () => {
    const token = await AsyncStorage.getItem('userToken');
    setIsFetching(true);

    try {
      const [driverRes, truckRes] = await Promise.all([
        api.get('/users', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/trucks', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setDrivers(driverRes.data.filter(d => d.role === "driver").map(d => ({ label: d.name, value: d._id })));
      setTrucks(truckRes.data.map(t => ({ label: `${t.name} (${t.licensePlate})`, value: t._id })));
    } catch (error) {
      displayCustomAlert('error', "Erreur de chargement", "Impossible de charger les données des chauffeurs et camions.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createDelivery = async () => {
    if (!selectedDriver || !selectedTruck || !selectedDriver.value || !selectedTruck.value) {
      displayCustomAlert('error', "Erreur de saisie", "Veuillez sélectionner un chauffeur et un camion valides.");
      return;
    }

    // Validation : les bouteilles pleines sont obligatoires
    if (!fullSent || parseInt(fullSent) <= 0) {
      displayCustomAlert('error', "Erreur de saisie", "Veuillez entrer le nombre de bouteilles pleines à envoyer.");
      return;
    }

    setIsLoading(true);
    const token = await AsyncStorage.getItem('userToken');

    try {
      const deliveryData = {
        driver: selectedDriver.value,
        truck: selectedTruck.value,
        fullBottlesSent: parseInt(fullSent) || 0,
        emptyBottlesSent: 0,
      };

      const response = await api.post('/deliveries', deliveryData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Sauvegarder la livraison dans le stockage local pour l'historique
      const newDelivery = {
        ...response.data,
        driverName: selectedDriver.label,
        truckName: selectedTruck.label,
        status: response.data.status || 'en cours',
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString(),
      };

      // Récupérer l'utilisateur connecté
      const userIdentifier = await AsyncStorage.getItem('userIdentifier');
      if (userIdentifier) {
        const storageKey = `deliveries_${userIdentifier}`;
        
        // Récupérer les livraisons existantes de cet utilisateur
        const existingDeliveries = await AsyncStorage.getItem(storageKey);
        const deliveries = existingDeliveries ? JSON.parse(existingDeliveries) : [];
        
        // Ajouter la nouvelle livraison au début de la liste
        deliveries.unshift(newDelivery);
        
        // Sauvegarder la liste mise à jour pour cet utilisateur
        await AsyncStorage.setItem(storageKey, JSON.stringify(deliveries));
      }

      Keyboard.dismiss();
      displayCustomAlert('success', "Succès !", `Livraison créée avec succès.\n\nID: ${response.data._id}\nChauffeur: ${selectedDriver.label}\nCamion: ${selectedTruck.label}`);
      setFullSent('');
      setSelectedDriver(null);
      setSelectedTruck(null);
    } catch (err) {
      // Ne log que les vraies erreurs, pas les erreurs de stock insuffisant
      if (!err.response || !err.response.data || err.response.data.error !== "Stock insuffisant") {
        console.error("Erreur lors de la création de la livraison:", err.response ? err.response.data : err.message);
      }
      
      if (err.response && err.response.data && err.response.data.error === "Stock insuffisant") {
        displayCustomAlert('error', "Stock insuffisant", "Le stock disponible est insuffisant pour cette livraison.\n\nVérifiez les quantités disponibles dans l'écran Stock avant de créer la livraison.");
      } else if (err.response && err.response.status === 403) {
        displayCustomAlert('error', "Accès refusé", "Vous n'avez pas les permissions nécessaires pour créer une livraison. Seuls les contrôleurs peuvent créer des livraisons.");
      } else if (err.response && err.response.status === 400) {
        displayCustomAlert('error', "Données invalides", "Veuillez vérifier les données saisies et réessayer.");
      } else {
        displayCustomAlert('error', "Échec de création", "Échec de création de la livraison. Réessayez plus tard.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderDriverDropdownButton = (selectedItem, isOpened) => {
    return (
      <View style={styles.dropdownButton}>
        <AntDesign 
          style={styles.inputIcon} 
          color={'#4c669f'} 
          name="user" 
          size={20} 
        />
        <View style={styles.dropdownTextWrapper}> 
          <Text 
            style={selectedItem ? styles.selectedTextStyle : styles.placeholderStyle}
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {(selectedItem && selectedItem.label) || 'Sélectionner un chauffeur'}
          </Text>
        </View>
        <AntDesign 
          style={styles.arrowIcon} 
          color={'#4c669f'} 
          name={isOpened ? "caretup" : "caretdown"} 
          size={16} 
        />
      </View>
    );
  };

  const renderTruckDropdownButton = (selectedItem, isOpened) => {
    return (
      <View style={styles.dropdownButton}>
        <AntDesign 
          style={styles.inputIcon} 
          color={'#4c669f'} 
          name="truck" 
          size={20} 
        />
        <View style={styles.dropdownTextWrapper}> 
          <Text 
            style={selectedItem ? styles.selectedTextStyle : styles.placeholderStyle}
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {(selectedItem && selectedItem.label) || 'Sélectionner un camion'}
          </Text>
        </View>
        <AntDesign 
          style={styles.arrowIcon} 
          color={'#4c669f'} 
          name={isOpened ? "caretup" : "caretdown"} 
          size={16} 
        />
      </View>
    );
  };

  const renderDropdownItem = (item, isSelected) => {
    return (
      <View style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}>
        <Text style={styles.dropdownItemText}>{item.label}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <MaterialIcons name="add-circle" size={30} color="white" />
              <Text style={styles.headerTitle}>MonAppGaz</Text>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {isFetching ? (
              <ActivityIndicator size="large" color="#4c669f" style={styles.loader} />
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Chauffeur</Text>
                  <Dropdown
                    data={drivers}
                    onSelect={item => setSelectedDriver(item)}
                    renderButton={renderDriverDropdownButton}
                    renderItem={renderDropdownItem}
                    valueField="value"
                    labelField="label"
                    maxHeight={300}
                    value={selectedDriver}
                    dropdownStyle={styles.dropdownListStyle}
                    search
                    searchPlaceholder="Rechercher..."
                    placeholder="Sélectionner un chauffeur"
                    onChange={item => setSelectedDriver(item)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Camion</Text>
                  <Dropdown
                    data={trucks}
                    onSelect={item => setSelectedTruck(item)}
                    renderButton={renderTruckDropdownButton}
                    renderItem={renderDropdownItem}
                    valueField="value"
                    labelField="label"
                    maxHeight={300}
                    value={selectedTruck}
                    dropdownStyle={styles.dropdownListStyle}
                    search
                    searchPlaceholder="Rechercher..."
                    placeholder="Sélectionner un camion"
                    onChange={item => setSelectedTruck(item)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Bouteilles pleines envoyées <Text style={styles.required}>*</Text></Text>
                  <View style={styles.inputContainer}>
                    <FontAwesome5 name="gas-pump" size={24} color="#4c669f" style={styles.inputIcon} />
                    <TextInput
                      value={fullSent}
                      onChangeText={setFullSent}
                      keyboardType="numeric"
                      style={styles.input}
                      placeholder="Nombre de bouteilles pleines"
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]} 
                  onPress={createDelivery}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="add-circle" size={24} color="white" style={styles.buttonIcon} />
                      <Text style={styles.buttonText}>Créer la livraison</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      <CustomAlert 
        type={customAlertType}
        title={customAlertTitle}
        message={customAlertMessage}
        isVisible={showCustomAlert}
        onDismiss={handleDismissAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  dropdownContainer: {
    // Pas besoin de styles spécifiques ici, car renderButton les gère
  },
  dropdown: {
    height: 50, 
    width: '100%', 
  },
  inputIcon: {
    marginRight: 8,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  // Styles pour le Dropdown personnalisé
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a0b4d4',
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    justifyContent: 'space-between',
  },
  dropdownTextWrapper: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    marginLeft: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#3b5998',
    fontWeight: '600',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  dropdownListStyle: {
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    flex: 1, 
  },
  dropdownItemSelected: {
    backgroundColor: '#e6eaf2', 
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left', 
    flex: 1,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left', 
    flex: 1,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  required: {
    color: 'red',
    fontWeight: 'bold',
  },
  helperText: {
    color: '#666',
    fontSize: 12,
  },
});
