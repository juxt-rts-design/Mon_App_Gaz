import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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

export default function UpdateDeliveryScreen() {
  const [deliveryId, setDeliveryId] = useState('');
  const [fullReturned, setFullReturned] = useState('');
  const [emptyReturned, setEmptyReturned] = useState('');
  const [status, setStatus] = useState('terminée');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertType, setCustomAlertType] = useState('success');
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [deliveryDetails, setDeliveryDetails] = useState(null);

  const statusOptions = [
    { label: 'En cours', value: 'en cours' },
    { label: 'Terminée', value: 'terminée' },
    { label: 'Annulée', value: 'annulée' }
  ];

  const findDeliveryById = async (id) => {
    try {
      const userIdentifier = await AsyncStorage.getItem('userIdentifier');
      if (userIdentifier) {
        const storageKey = `deliveries_${userIdentifier}`;
        const existingDeliveries = await AsyncStorage.getItem(storageKey);
        
        if (existingDeliveries) {
          const deliveries = JSON.parse(existingDeliveries);
          const delivery = deliveries.find(d => d._id === id);
          return delivery;
        }
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la recherche de la livraison:', error);
      return null;
    }
  };

  const validateQuantities = (fullReturned, emptyReturned) => {
    if (!deliveryDetails) return true;

    const fullSent = deliveryDetails.fullBottlesSent || 0;
    const emptySent = deliveryDetails.emptyBottlesSent || 0;

    // Vérifier que les valeurs sont des nombres valides
    if (fullReturned && isNaN(parseInt(fullReturned))) {
      displayCustomAlert('error', "Format invalide", "Le nombre de bouteilles pleines doit être un nombre valide.");
      return false;
    }

    if (emptyReturned && isNaN(parseInt(emptyReturned))) {
      displayCustomAlert('error', "Format invalide", "Le nombre de bouteilles vides doit être un nombre valide.");
      return false;
    }

    // Vérifier les valeurs négatives
    if (parseInt(fullReturned) < 0) {
      displayCustomAlert('error', "Quantité invalide", "Le nombre de bouteilles pleines retournées ne peut pas être négatif.");
      return false;
    }

    if (parseInt(emptyReturned) < 0) {
      displayCustomAlert('error', "Quantité invalide", "Le nombre de bouteilles vides retournées ne peut pas être négatif.");
      return false;
    }

    // Vérifier les quantités supérieures à ce qui a été envoyé
    if (parseInt(fullReturned) > fullSent) {
      displayCustomAlert('error', "Quantité invalide", `Vous ne pouvez pas retourner plus de ${fullSent} bouteilles pleines (envoyées: ${fullSent})`);
      return false;
    }

    if (parseInt(emptyReturned) > emptySent) {
      displayCustomAlert('error', "Quantité invalide", `Vous ne pouvez pas retourner plus de ${emptySent} bouteilles vides (envoyées: ${emptySent})`);
      return false;
    }

    return true;
  };

  const validateQuantitiesWithDelivery = (fullReturned, emptyReturned, delivery) => {
    if (!delivery) return true;

    const fullSent = delivery.fullBottlesSent || 0;

    // Vérifier que les valeurs sont des nombres valides
    if (fullReturned && isNaN(parseInt(fullReturned))) {
      displayCustomAlert('error', "Format invalide", "Le nombre de bouteilles pleines doit être un nombre valide.");
      return false;
    }

    if (emptyReturned && isNaN(parseInt(emptyReturned))) {
      displayCustomAlert('error', "Format invalide", "Le nombre de bouteilles vides doit être un nombre valide.");
      return false;
    }

    // Vérifier les valeurs négatives
    if (parseInt(fullReturned) < 0) {
      displayCustomAlert('error', "Quantité invalide", "Le nombre de bouteilles pleines retournées ne peut pas être négatif.");
      return false;
    }

    if (parseInt(emptyReturned) < 0) {
      displayCustomAlert('error', "Quantité invalide", "Le nombre de bouteilles vides retournées ne peut pas être négatif.");
      return false;
    }

    // Calculer la somme des bouteilles retournées
    const totalReturned = parseInt(fullReturned || 0) + parseInt(emptyReturned || 0);

    // Vérifier que la somme égale les bouteilles pleines envoyées
    if (totalReturned !== fullSent) {
      displayCustomAlert('error', "Quantité invalide", `La somme des bouteilles retournées (${totalReturned}) doit être égale aux bouteilles pleines envoyées (${fullSent}).\n\nExemple : si ${fullSent} bouteilles ont été envoyées, vous devez retourner exactement ${fullSent} bouteilles au total (pleines + vides).`);
      return false;
    }

    return true;
  };

  const renderStatusDropdownButton = (selectedItem, isOpened) => {
    return (
      <View style={styles.dropdownButton}>
        <MaterialIcons 
          style={styles.inputIcon} 
          color={'#4c669f'} 
          name="update" 
          size={20} 
        />
        <View style={styles.dropdownTextWrapper}> 
          <Text 
            style={selectedItem ? styles.selectedTextStyle : styles.placeholderStyle}
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {(selectedItem && selectedItem.label) || 'Sélectionner un statut'}
          </Text>
        </View>
        <MaterialIcons 
          style={styles.arrowIcon} 
          color={'#4c669f'} 
          name={isOpened ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
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

  const displayCustomAlert = (type, title, message) => {
    setCustomAlertType(type);
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setShowCustomAlert(true);
  };

  const handleDismissAlert = () => {
    setShowCustomAlert(false);
  };

  const handleUpdate = async () => {
    if (!deliveryId) {
      displayCustomAlert('error', "Erreur de saisie", "Veuillez entrer l'ID de la livraison.");
      return;
    }

    // Récupérer les détails de la livraison pour validation
    const delivery = await findDeliveryById(deliveryId);
    if (!delivery) {
      displayCustomAlert('error', "Livraison non trouvée", "Cette livraison n'existe pas dans votre historique.");
      return;
    }
    
    // Définir deliveryDetails AVANT la validation
    setDeliveryDetails(delivery);

    const token = await AsyncStorage.getItem('userToken');
    const updateData = {};

    if (fullReturned) {
      updateData.fullBottlesReturned = parseInt(fullReturned, 10);
    }
    if (emptyReturned) {
      updateData.emptyBottlesReturned = parseInt(emptyReturned, 10);
    }

    if (Object.keys(updateData).length === 0 && status === 'terminée') {
      displayCustomAlert('info', "Aucune modification", "Veuillez entrer au moins une valeur à mettre à jour ou changer le statut.");
      return;
    }

    // Valider les quantités AVANT de commencer le chargement
    // Utiliser directement delivery au lieu de deliveryDetails
    if (!validateQuantitiesWithDelivery(fullReturned || 0, emptyReturned || 0, delivery)) {
      return; // Arrêter ici si validation échoue
    }

    setIsLoading(true);
    updateData.status = status;

    try {
      const response = await api.patch(`/deliveries/${deliveryId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Mettre à jour manuellement le stock si des bouteilles vides sont retournées
      if (emptyReturned && parseInt(emptyReturned) > 0) {
        try {
          await api.patch('/stock', {
            emptyBottles: parseInt(emptyReturned),
            type: 'entrée',
            description: `Retour de ${emptyReturned} bouteilles vides de la livraison ${deliveryId}`
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log(`✅ Stock mis à jour avec ${emptyReturned} bouteilles vides`);
        } catch (stockError) {
          console.error('❌ Erreur lors de la mise à jour du stock:', stockError.response?.data || stockError.message);
          // Ne pas bloquer la mise à jour de la livraison si le stock échoue
        }
      }

      // Mettre à jour la livraison dans le stockage local
      const userIdentifier = await AsyncStorage.getItem('userIdentifier');
      if (userIdentifier) {
        const storageKey = `deliveries_${userIdentifier}`;
        const existingDeliveries = await AsyncStorage.getItem(storageKey);
        
        if (existingDeliveries) {
          const deliveries = JSON.parse(existingDeliveries);
          const deliveryIndex = deliveries.findIndex(d => d._id === deliveryId);
          
          if (deliveryIndex !== -1) {
            // Mettre à jour la livraison avec les nouvelles données
            deliveries[deliveryIndex] = {
              ...deliveries[deliveryIndex],
              ...response.data.livraison,
              status: status,
              updatedAt: new Date().toISOString(),
            };
            
            // Sauvegarder la liste mise à jour pour cet utilisateur
            await AsyncStorage.setItem(storageKey, JSON.stringify(deliveries));
          }
        }
      }

      Keyboard.dismiss();
      
      let successMessage = `Livraison mise à jour avec succès.\n\n${response.data.message || 'Mise à jour effectuée'}`;
      if (emptyReturned && parseInt(emptyReturned) > 0) {
        successMessage += `\n\n✅ ${emptyReturned} bouteilles vides ajoutées au stock`;
      }
      
      displayCustomAlert('success', "Succès !", successMessage);
      setDeliveryId('');
      setFullReturned('');
      setEmptyReturned('');
      setStatus('terminée');
      setDeliveryDetails(null);
    } catch (err) {
      let errorMessage = "Échec de mise à jour de la livraison. Vérifiez l'ID et la connexion.";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = "Livraison non trouvée. Vérifiez l'ID de la livraison.";
        } else if (err.response.status === 403) {
          errorMessage = "Vous n'avez pas les permissions nécessaires pour modifier cette livraison. Seuls les contrôleurs peuvent modifier les livraisons.";
        } else if (err.response.status === 400) {
          errorMessage = "Données invalides. Vérifiez les valeurs saisies.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      console.error("Erreur lors de la mise à jour de la livraison:", err.response ? err.response.data : err.message);
      displayCustomAlert('error', "Échec de mise à jour", errorMessage);
    } finally {
      setIsLoading(false);
    }
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
              <MaterialIcons name="local-shipping" size={30} color="white" />
              <Text style={styles.headerTitle}>MonAppGaz</Text>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ID de la Livraison</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="confirmation-number" size={24} color="#4c669f" style={styles.inputIcon} />
                  <TextInput
                    value={deliveryId}
                    onChangeText={setDeliveryId}
                    style={styles.input}
                    placeholder="Collez l'ID copié depuis l'historique"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text style={styles.helperText}>
                  💡 Copiez l'ID depuis l'écran Historique des Livraisons
                </Text>
              </View>

              {deliveryDetails && (
                <View style={styles.deliveryInfoCard}>
                  <Text style={styles.deliveryInfoTitle}>Détails de la livraison</Text>
                  <View style={styles.deliveryInfoRow}>
                    <Text style={styles.deliveryInfoLabel}>Bouteilles pleines envoyées:</Text>
                    <Text style={styles.deliveryInfoValue}>{deliveryDetails.fullBottlesSent || 0}</Text>
                  </View>
                  <Text style={styles.deliveryInfoNote}>
                    ⚠️ La somme des bouteilles retournées (pleines + vides) doit être égale à {deliveryDetails.fullBottlesSent || 0}
                  </Text>
                  <Text style={styles.deliveryInfoExample}>
                    💡 Exemple : {deliveryDetails.fullBottlesSent || 0} bouteilles envoyées = 20 pleines + 5 vides retournées
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bouteilles pleines retournées</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="gas-pump" size={24} color="#4c669f" style={styles.inputIcon} />
                  <TextInput
                    value={fullReturned}
                    onChangeText={setFullReturned}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="Nombre de bouteilles pleines"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bouteilles vides retournées</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="flask" size={24} color="#4c669f" style={styles.inputIcon} />
                  <TextInput
                    value={emptyReturned}
                    onChangeText={setEmptyReturned}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="Nombre de bouteilles vides"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Statut</Text>
                <Dropdown
                  data={statusOptions}
                  onSelect={item => setStatus(item.value)}
                  renderButton={renderStatusDropdownButton}
                  renderItem={renderDropdownItem}
                  valueField="value"
                  labelField="label"
                  maxHeight={300}
                  value={statusOptions.find(item => item.value === status)}
                  dropdownStyle={styles.dropdownListStyle}
                  search
                  searchPlaceholder="Rechercher..."
                  placeholder="Sélectionner un statut"
                  onChange={item => setStatus(item.value)}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="update" size={24} color="white" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Mettre à jour</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  inputIcon: {
    marginRight: 8,
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
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left', 
    flex: 1,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left', 
    flex: 1,
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
  dropdownItemSelected: {
    backgroundColor: '#e6eaf2', 
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    flex: 1, 
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  deliveryInfoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  deliveryInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  deliveryInfoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginRight: 10,
  },
  deliveryInfoValue: {
    fontSize: 16,
    color: '#333',
  },
  deliveryInfoNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  deliveryInfoExample: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
