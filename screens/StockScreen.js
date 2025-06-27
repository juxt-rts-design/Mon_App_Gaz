import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import CustomAlert from '../components/ui/CustomAlert';
import api from '../services/api';

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  android: {
    elevation: 6,
    shadowColor: '#000',
  },
});

export default function StockScreen() {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [customAlertType, setCustomAlertType] = useState('success');
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [addStockLoading, setAddStockLoading] = useState(false);
  const [fullBottlesToAdd, setFullBottlesToAdd] = useState('');
  const [consignedBottlesToAdd, setConsignedBottlesToAdd] = useState('');

  const displayCustomAlert = (type, title, message) => {
    setCustomAlertType(type);
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setShowCustomAlert(true);
  };

  const handleDismissAlert = () => {
    setShowCustomAlert(false);
  };

  const getStock = async () => {
    const token = await AsyncStorage.getItem('userToken');
    setLoading(true);

    try {
      if (!token) {
        displayCustomAlert('error', "Erreur d'authentification", "Token non trouvé. Veuillez vous reconnecter.");
        throw new Error('Token non trouvé');
      }

      // Fetch current stock
      const stockRes = await api.get('/stock', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!stockRes.data || typeof stockRes.data !== 'object') {
        displayCustomAlert('error', "Erreur de données", "Format de données de stock invalide.");
        throw new Error('Format de données invalide');
      }
      const currentStockData = {
        fullBottles: parseInt(stockRes.data.fullBottles) || 0,
        emptyBottles: parseInt(stockRes.data.emptyBottles) || 0,
        consignedBottles: parseInt(stockRes.data.consignedBottles) || 0
      };
      setStock(currentStockData);
      console.log('Current Stock Data:', currentStockData);

    } catch (error) {
      console.error("Erreur de chargement du stock:", error.message);
      setStock({
        fullBottles: 0,
        emptyBottles: 0,
        consignedBottles: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const addStock = async () => {
    const fullBottles = parseInt(fullBottlesToAdd) || 0;
    const consignedBottles = parseInt(consignedBottlesToAdd) || 0;
    // Les bouteilles vides sont toujours à 0 lors de l'ajout manuel
    const emptyBottles = 0;

    if (fullBottles === 0 && consignedBottles === 0) {
      displayCustomAlert('error', "Erreur de saisie", "Veuillez entrer au moins une quantité à ajouter.");
      return;
    }

    setAddStockLoading(true);
    const token = await AsyncStorage.getItem('userToken');

    try {
      const response = await api.patch('/stock', {
        fullBottles,
        emptyBottles,
        consignedBottles
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      displayCustomAlert('success', "Succès !", "Stock mis à jour avec succès.");
      
      // Réinitialiser les champs
      setFullBottlesToAdd('');
      setConsignedBottlesToAdd('');
      setShowAddStockForm(false);
      
      // Recharger le stock
      await getStock();

    } catch (error) {
      let errorMessage = "Erreur lors de la mise à jour du stock.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      displayCustomAlert('error', "Erreur", errorMessage);
    } finally {
      setAddStockLoading(false);
    }
  };

  useEffect(() => {
    getStock();
  }, []);

  const screenWidth = Dimensions.get('window').width;

  const StockCard = ({ title, value, icon, color, forceZero }) => (
    <View style={styles.stockCard}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.cardGradient}
      >
        <FontAwesome5 name={icon} size={24} color="white" />
        <Text style={styles.cardValue}>{forceZero ? 0 : value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  const pieChartData = stock ? [
    { name: 'Pleines', population: stock.fullBottles, color: '#4c669f', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Vides', population: stock.emptyBottles, color: '#f44336', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Consignées', population: stock.consignedBottles, color: '#4caf50', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ] : [];

  const totalStock = stock ? stock.fullBottles + stock.emptyBottles + stock.consignedBottles : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <MaterialIcons name="inventory" size={30} color="white" />
          <Text style={styles.headerTitle}>MonAppGaz</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#4c669f" style={styles.loader} />
      ) : stock ? (
        <ScrollView style={styles.content}>
          <View style={styles.statsGrid}>
            <StockCard 
              title="Bouteilles Pleines" 
              value={stock.fullBottles} 
              icon="gas-pump" 
              color="#4c669f"
            />
            <StockCard 
              title="Bouteilles Vides" 
              value={stock.emptyBottles > 0 ? stock.emptyBottles : 0} 
              icon="flask" 
              color="#f44336"
            />
            <StockCard 
              title="Bouteilles Consignées" 
              value={stock.consignedBottles} 
              icon="recycle" 
              color="#4CAF50"
            />
          </View>

          <View style={styles.addStockSection}>
            <TouchableOpacity 
              style={styles.addStockButton} 
              onPress={() => setShowAddStockForm(!showAddStockForm)}
            >
              <MaterialIcons name="add-circle" size={24} color="white" />
              <Text style={styles.addStockButtonText}>
                {showAddStockForm ? 'Masquer' : 'Ajouter du stock'}
              </Text>
            </TouchableOpacity>

            {showAddStockForm && (
              <View style={styles.addStockForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bouteilles pleines à ajouter</Text>
                  <TextInput
                    value={fullBottlesToAdd}
                    onChangeText={setFullBottlesToAdd}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bouteilles consignées à ajouter</Text>
                  <TextInput
                    value={consignedBottlesToAdd}
                    onChangeText={setConsignedBottlesToAdd}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.infoNote}>
                  <MaterialIcons name="info" size={16} color="#4c669f" />
                  <Text style={styles.infoText}>
                    💡 Les bouteilles vides ne peuvent être ajoutées que via les retours de livraison
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, addStockLoading && styles.submitButtonDisabled]} 
                  onPress={addStock}
                  disabled={addStockLoading}
                >
                  {addStockLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <MaterialIcons name="save" size={20} color="white" />
                      <Text style={styles.submitButtonText}>Ajouter au stock</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {totalStock > 0 ? (
            <View style={styles.pieChartContainer}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="pie-chart" size={24} color="#4c669f" />
                <Text style={styles.sectionTitle}>Répartition du Stock</Text>
              </View>
              <PieChart
                data={pieChartData}
                width={screenWidth}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Aucun stock à afficher dans le graphique.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Impossible de charger les données du stock.</Text>
        </View>
      )}

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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  stockCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 15,
  },
  cardValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  addStockSection: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  addStockButton: {
    backgroundColor: '#4c669f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    ...shadowStyle,
  },
  addStockButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  addStockForm: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    ...shadowStyle,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pieChartContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#4c669f',
    fontSize: 14,
    marginLeft: 5,
  },
});
