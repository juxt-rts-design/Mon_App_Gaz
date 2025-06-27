import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

const api = axios.create({
  baseURL: API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PENDING_REQUESTS_KEY = 'pendingRequests';

// Function to get pending requests from AsyncStorage
const getPendingRequests = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load pending requests from storage', e);
    return [];
  }
};

// Function to save pending requests to AsyncStorage
const savePendingRequests = async (requests) => {
  try {
    const jsonValue = JSON.stringify(requests);
    await AsyncStorage.setItem(PENDING_REQUESTS_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save pending requests to storage', e);
  }
};

// Function to add a request to the pending queue
const addPendingRequest = async (request) => {
  const requests = await getPendingRequests();
  requests.push(request);
  await savePendingRequests(requests);
};

// Synchronization logic
const syncPendingRequests = async () => {
  console.log('Attempting to sync pending requests...');
  const pendingRequests = await getPendingRequests();

  if (pendingRequests.length === 0) {
    console.log('No pending requests to sync.');
    return;
  }

  const successfullySynced = [];
  const failedToSync = [];

  for (const req of pendingRequests) {
    try {
      console.log(`Syncing request: ${req.method.toUpperCase()} ${req.url}`);
      // Add a flag to the request to avoid re-queuing it by the interceptor
      const config = { ...req, _retry: true };
      const response = await api(config); // Use the axios instance directly
      console.log(`Successfully synced: ${req.method.toUpperCase()} ${req.url}`, response.data);
      successfullySynced.push(req);
    } catch (syncError) {
      console.error(`Failed to sync request: ${req.method.toUpperCase()} ${req.url}`, syncError.response ? syncError.response.data : syncError.message);
      failedToSync.push(req);
    }
  }

  // Only remove successfully synced requests from the queue
  const remainingRequests = pendingRequests.filter(
    (req) => !successfullySynced.includes(req)
  );
  await savePendingRequests(remainingRequests);

  if (failedToSync.length > 0) {
    console.warn(`${failedToSync.length} requests failed to sync. They remain in the queue.`);
  } else {
    console.log('All pending requests synced successfully.');
  }
};

// Axios Interceptor for handling offline requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Condition to avoid logging the "expected" 404 for deliveries
    const isDeliveries404 = error.response?.status === 404 && originalRequest.url?.includes('deliveries');

    if (!isDeliveries404) {
      // Log d'erreur amélioré
      if (error.response) {
        console.error(`❌ Erreur API [${error.response.status}] :`, error.response.data || error.message);
      } else if (error.request) {
        console.error('❌ Erreur API : Pas de réponse du serveur', error.message);
      } else {
        console.error('❌ Erreur API :', error.message);
      }
    }

    // Do not queue if it's a 401 (unauthorized) error or if it's already a retry attempt
    if (error.response && error.response.status === 401) {
      // You might want to handle logout/redirect here
      return Promise.reject(error);
    }

    const netInfoState = await NetInfo.fetch();

    if (!netInfoState.isConnected && originalRequest._retry === undefined) {
      // Only queue if it's a modifying request
      if (['post', 'put', 'delete', 'patch'].includes(originalRequest.method)) {
        console.log('No internet connection, queuing request:', originalRequest.url);
        await addPendingRequest({
          url: originalRequest.url,
          method: originalRequest.method,
          data: originalRequest.data,
          headers: originalRequest.headers,
        });
        // Resolve the promise to prevent further error handling, as it's now queued
        return Promise.resolve({ status: 200, data: { message: 'Request queued due to offline mode' } });
      }
    }
    return Promise.reject(error);
  }
);

// Listen for network state changes
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    console.log('Internet connection restored. Attempting to sync pending requests.');
    syncPendingRequests();
  } else {
    console.log('No internet connection.');
  }
});

export default api;
