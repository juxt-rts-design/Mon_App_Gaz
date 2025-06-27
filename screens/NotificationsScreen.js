import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      let errorMessage = 'Impossible de charger les notifications.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Le point d\'accès pour les notifications est introuvable (Erreur 404).';
        } else if (error.response.status === 403) {
          errorMessage = 'Accès refusé aux notifications.';
        }
      }
      console.error('Erreur lors du chargement des notifications:', error.response ? error.response.data : error.message);
      Alert.alert('Erreur', errorMessage);
      setNotifications([]);
    } finally {
      if (!isRefreshing) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(true);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await api.put(`/notifications/${notificationId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mettre à jour l'état local
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error.response ? error.response.data : error.message);
      Alert.alert('Erreur', 'Impossible de marquer la notification comme lue.');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stock':
        return 'box';
      case 'livraison':
        return 'truck';
      case 'salaire':
        return 'money-bill-wave';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'stock':
        return '#4c669f';
      case 'livraison':
        return '#3b5998';
      case 'salaire':
        return '#192f6a';
      default:
        return '#666';
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]} 
      onPress={() => !item.isRead && markAsRead(item._id)}
      disabled={item.isRead}
    >
      <View style={styles.cardHeader}>
        <FontAwesome5 
          name={getNotificationIcon(item.type)} 
          size={20} 
          color={getNotificationColor(item.type)} 
          style={styles.cardIcon} 
        />
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
          {!item.isRead && <View style={styles.unreadIndicator} />}
        </View>
        <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.messageText}>{item.message}</Text>
        {!item.isRead && (
          <Text style={styles.tapToRead}>Appuyez pour marquer comme lu</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <MaterialIcons name="notifications" size={30} color="white" />
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#4c669f" style={styles.loader} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucune notification trouvée.</Text>}
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
    position: 'relative',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: -5,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
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
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4c669f',
    backgroundColor: '#f8f9ff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  cardIcon: {
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4c669f',
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  cardContent: {
    paddingLeft: 5,
  },
  messageText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
  },
  tapToRead: {
    fontSize: 12,
    color: '#4c669f',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
}); 