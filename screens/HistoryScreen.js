import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchDeliveries = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      // Récupérer l'utilisateur connecté
      const userToken = await AsyncStorage.getItem('userToken');
      const userIdentifier = await AsyncStorage.getItem('userIdentifier');
      
      if (!userToken || !userIdentifier) {
        setDeliveries([]);
        return;
      }

      // Utiliser l'identifiant email pour l'historique
      const storageKey = `deliveries_${userIdentifier}`;
      const storedDeliveries = await AsyncStorage.getItem(storageKey);
      if (storedDeliveries) {
        const parsedDeliveries = JSON.parse(storedDeliveries);
        setDeliveries(parsedDeliveries);
      } else {
        setDeliveries([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      setDeliveries([]);
    } finally {
      if (!isRefreshing) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDeliveries();
    }, [fetchDeliveries])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeliveries(true);
  }, [fetchDeliveries]);

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copié !', 'ID de livraison copié dans le presse-papiers');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de copier l\'ID');
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      'Nettoyer l\'historique',
      'Êtes-vous sûr de vouloir supprimer tout votre historique de livraisons ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const userIdentifier = await AsyncStorage.getItem('userIdentifier');
              if (userIdentifier) {
                const storageKey = `deliveries_${userIdentifier}`;
                await AsyncStorage.removeItem(storageKey);
                setDeliveries([]);
                Alert.alert('Succès', 'Historique supprimé avec succès');
              }
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'historique:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'historique');
            }
          },
        },
      ]
    );
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

  const renderDeliveryItem = ({ item }) => (
    <View style={styles.deliveryCard}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="local-shipping" size={24} color="#4c669f" style={styles.cardIcon} />
        <View style={styles.headerInfo}>
          <TouchableOpacity 
            style={styles.idContainer}
            onPress={() => copyToClipboard(item._id)}
          >
            <Text style={styles.cardTitle}>Livraison #{item._id?.slice(-6) || 'N/A'}</Text>
            <MaterialIcons name="content-copy" size={16} color="#4c669f" style={styles.copyIcon} />
          </TouchableOpacity>
          <View style={styles.statusContainer}>
            <MaterialIcons 
              name={getStatusIcon(item.status)} 
              size={16} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.idFullContainer}>
          <Text style={styles.idLabel}>ID complet:</Text>
          <TouchableOpacity 
            style={styles.idFullBox}
            onPress={() => copyToClipboard(item._id)}
          >
            <Text style={styles.idFullText} numberOfLines={1} ellipsizeMode="middle">
              {item._id || 'N/A'}
            </Text>
            <MaterialIcons name="content-copy" size={16} color="#4c669f" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.infoLabel}>Chauffeur:</Text>
          <Text style={styles.infoValue}>{item.driverName || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="local-shipping" size={16} color="#666" />
          <Text style={styles.infoLabel}>Camion:</Text>
          <Text style={styles.infoValue}>{item.truckName || 'N/A'}</Text>
        </View>

        <View style={styles.bottlesSection}>
          <Text style={styles.sectionTitle}>Bouteilles envoyées:</Text>
          <View style={styles.bottlesRow}>
            <FontAwesome5 name="gas-pump" size={14} color="#4c669f" />
            <Text style={styles.bottleInfo}>Pleines: {item.fullBottlesSent || 0}</Text>
            <FontAwesome5 name="recycle" size={14} color="#4c669f" style={styles.bottleIcon} />
            <Text style={styles.bottleInfo}>Vides: {item.emptyBottlesSent || 0}</Text>
          </View>
          {item.consignedBottles > 0 && (
            <View style={styles.bottlesRow}>
              <FontAwesome5 name="box" size={14} color="#4c669f" />
              <Text style={styles.bottleInfo}>Consignées: {item.consignedBottles}</Text>
            </View>
          )}
        </View>

        {(item.fullBottlesReturned > 0 || item.emptyBottlesReturned > 0) && (
          <View style={styles.bottlesSection}>
            <Text style={styles.sectionTitle}>Bouteilles retournées:</Text>
            <View style={styles.bottlesRow}>
              <FontAwesome5 name="gas-pump" size={14} color="#4c669f" />
              <Text style={styles.bottleInfo}>Pleines: {item.fullBottlesReturned || 0}</Text>
              <FontAwesome5 name="flask" size={14} color="#4c669f" style={styles.bottleIcon} />
              <Text style={styles.bottleInfo}>Vides: {item.emptyBottlesReturned || 0}</Text>
            </View>
          </View>
        )}

        <View style={styles.timestamp}>
          <MaterialIcons name="access-time" size={14} color="#666" />
          <Text style={styles.timestampText}>
            Créée le {new Date(item.createdAt).toLocaleDateString('fr-FR')} à {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <MaterialIcons name="history" size={30} color="white" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Historique des Livraisons</Text>
          </View>
          {deliveries.length > 0 && (
            <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
              <MaterialIcons name="delete-sweep" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#4c669f" style={styles.loader} />
      ) : (
        <FlatList
          data={deliveries}
          keyExtractor={(item) => item._id || item.timestamp}
          renderItem={renderDeliveryItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="local-shipping" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune livraison trouvée</Text>
              <Text style={styles.emptySubtext}>Les livraisons créées apparaîtront ici</Text>
              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={20} color="#4c669f" />
                <Text style={styles.infoText}>
                  Votre historique est conservé même après déconnexion
                </Text>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4c669f']} />
          }
        />
      )}
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
    justifyContent: 'space-between',
  },
  headerTextContainer: {
    flexDirection: 'column',
    marginLeft: 10,
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    padding: 15,
  },
  deliveryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  cardIcon: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  copyIcon: {
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  cardContent: {
    paddingLeft: 4,
  },
  idFullContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  idLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  idFullBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  idFullText: {
    fontSize: 13,
    color: '#495057',
    fontFamily: 'monospace',
    flex: 1,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  bottlesSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  bottlesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottleInfo: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
    marginRight: 16,
  },
  bottleIcon: {
    marginLeft: 16,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  timestampText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
}); 