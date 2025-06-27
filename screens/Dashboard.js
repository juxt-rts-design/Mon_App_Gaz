import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
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

export default function Dashboard({ navigation }) {
  const [camions, setCamions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchTrucks = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await api.get('/trucks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCamions(res.data);
    } catch (err) {
      // Ne pas afficher d'alerte pour les erreurs de chargement
      console.log('Erreur chargement camions:', err.message);
      setCamions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setUnreadNotifications(0);
        return;
      }

      const response = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unreadCount = response.data.filter(notification => !notification.isRead).length;
      setUnreadNotifications(unreadCount);
    } catch (error) {
      // Ne pas logger les erreurs de notifications
      console.log('Erreur lors du chargement des notifications:', error.message);
      setUnreadNotifications(0);
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté avant de charger les données
    const checkAuthAndLoad = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        fetchTrucks();
        fetchUnreadNotifications();
      } else {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    checkAuthAndLoad();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrucks();
    fetchUnreadNotifications();
  };

  const logout = async () => {
    try {
      // Supprimer seulement les données de connexion, pas l'historique
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userIdentifier');
      
      navigation.replace('Login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, on déconnecte quand même
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userIdentifier');
      navigation.replace('Login');
    }
  };

  const MenuButton = ({ icon, title, onPress, color = '#4c669f' }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.menuGradient}
      >
        <FontAwesome5 name={icon} size={24} color="white" />
        <Text style={styles.menuButtonText} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <FontAwesome5 name="gas-pump" size={30} color="white" />
          <Text style={styles.headerTitle}>MonAppGaz</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.headerButton}>
              <View style={styles.notificationContainer}>
                <MaterialIcons name="notifications" size={24} color="white" />
                {unreadNotifications > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.headerButton}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.welcomeSubText}>Gérez vos livraisons efficacement</Text>
        </View>

        <View style={styles.menuGrid}>
          <MenuButton 
            icon="box" 
            title="Stock" 
            onPress={() => navigation.navigate('Stock')}
          />
          <MenuButton 
            icon="truck" 
            title="Livraisons" 
            onPress={() => navigation.navigate('UpdateDelivery')}
          />
          <MenuButton 
            icon="plus-circle" 
            title="Nouvelle livraison" 
            onPress={() => navigation.navigate('CreateDelivery')}
          />
          <MenuButton 
            icon="history" 
            title="Historique" 
            onPress={() => navigation.navigate('History')}
            style={styles.menuButtonRow}
          />
        </View>

        <View style={styles.trucksSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="local-shipping" size={24} color="#4c669f" />
            <Text style={styles.sectionTitle}>Flotte de camions</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#4c669f" style={styles.loader} />
          ) : (
            <FlatList
              data={camions}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.truckItem}>
                  <FontAwesome5 name="truck" size={20} color="#4c669f" />
                  <View style={styles.truckInfo}>
                    <Text style={styles.truckName}>{item.name}</Text>
                    <Text style={styles.truckPlate}>{item.licensePlate}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
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
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#4c669f',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
    marginHorizontal: 10,
    borderRadius: 15,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  menuButton: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  menuGradient: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    includeFontPadding: false,
  },
  menuButtonRow: {
    width: '100%',
  },
  trucksSection: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 15,
    padding: 15,
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
  truckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  truckInfo: {
    flex: 1,
    marginLeft: 15,
  },
  truckName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  truckPlate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loader: {
    padding: 20,
  },
});
