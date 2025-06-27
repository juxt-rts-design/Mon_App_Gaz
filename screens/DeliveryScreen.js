import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CustomAlert from '../components/ui/CustomAlert';

export default function DeliveryScreen() {
  const [deliveryId, setDeliveryId] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
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

  const fetchDelivery = async () => {
    if (!deliveryId.trim()) {
      displayCustomAlert('error', "Erreur de saisie", "Veuillez entrer l'ID de la livraison.");
      return;
    }

    setIsFetching(true);
    const token = await AsyncStorage.getItem('userToken');

    try {
      // Note: Cette route n'existe pas dans l'API, mais on peut simuler la récupération
      // en utilisant les logs ou en créant une route temporaire
      displayCustomAlert('info', "Information", "La route GET /api/deliveries/:id n'existe pas dans l'API.\n\nPour voir les détails d'une livraison, utilisez l'écran Historique qui affiche les logs d'actions.");
      
      // Si une route GET /api/deliveries/:id était disponible, le code serait :
      /*
      const response = await api.get(`/deliveries/${deliveryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDelivery(response.data);
      */
      
    } catch (err) {
      console.error("Erreur lors de la récupération de la livraison:", err.response ? err.response.data : err.message);
      displayCustomAlert('error', "Erreur", "Impossible de récupérer les détails de la livraison.");
    } finally {
      setIsFetching(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en cours':
        return '#ffa500';
      case 'terminée':
        return '#4CAF50';
      case 'annulée':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en cours':
        return 'local-shipping';
      case 'terminée':
        return 'check-circle';
      case 'annulée':
        return 'cancel';
      default:
        return 'help';
    }
  };

  return (
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

      <ScrollView style={styles.content}>
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

          <TouchableOpacity 
            style={[styles.button, isFetching && styles.buttonDisabled]} 
            onPress={fetchDelivery}
            disabled={isFetching}
          >
            {isFetching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="search" size={24} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Rechercher la livraison</Text>
              </>
            )}
          </TouchableOpacity>

          {delivery && (
            <View style={styles.deliveryDetails}>
              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>Informations générales</Text>
                
                <View style={styles.detailRow}>
                  <MaterialIcons name="person" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Chauffeur:</Text>
                  <Text style={styles.detailValue}>{delivery.driver?.name || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="local-shipping" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Camion:</Text>
                  <Text style={styles.detailValue}>{delivery.truck?.name || 'N/A'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name={getStatusIcon(delivery.status)} size={20} color={getStatusColor(delivery.status)} />
                  <Text style={styles.detailLabel}>Statut:</Text>
                  <Text style={[styles.detailValue, { color: getStatusColor(delivery.status) }]}>
                    {delivery.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>Bouteilles envoyées</Text>
                
                <View style={styles.detailRow}>
                  <FontAwesome5 name="gas-pump" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Pleines:</Text>
                  <Text style={styles.detailValue}>{delivery.fullBottlesSent}</Text>
                </View>

                <View style={styles.detailRow}>
                  <FontAwesome5 name="recycle" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Vides:</Text>
                  <Text style={styles.detailValue}>{delivery.emptyBottlesSent}</Text>
                </View>

                <View style={styles.detailRow}>
                  <FontAwesome5 name="box" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Consignées:</Text>
                  <Text style={styles.detailValue}>{delivery.consignedBottles || 0}</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>Bouteilles retournées</Text>
                
                <View style={styles.detailRow}>
                  <FontAwesome5 name="gas-pump" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Pleines:</Text>
                  <Text style={styles.detailValue}>{delivery.fullBottlesReturned || 0}</Text>
                </View>

                <View style={styles.detailRow}>
                  <FontAwesome5 name="flask" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Vides:</Text>
                  <Text style={styles.detailValue}>{delivery.emptyBottlesReturned || 0}</Text>
                </View>
              </View>

              <View style={styles.detailCard}>
                <Text style={styles.cardTitle}>Dates</Text>
                
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Créée le:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(delivery.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialIcons name="update" size={20} color="#4c669f" />
                  <Text style={styles.detailLabel}>Modifiée le:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(delivery.updatedAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#4c669f" />
            <Text style={styles.infoText}>
              Pour voir les détails des livraisons, utilisez l'écran Historique qui affiche les logs d'actions des livraisons.
            </Text>
          </View>
        </View>
      </ScrollView>

      <CustomAlert 
        type={customAlertType}
        title={customAlertTitle}
        message={customAlertMessage}
        isVisible={showCustomAlert}
        onDismiss={handleDismissAlert}
      />
    </View>
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
    marginBottom: 20,
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
  deliveryDetails: {
    marginTop: 20,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
