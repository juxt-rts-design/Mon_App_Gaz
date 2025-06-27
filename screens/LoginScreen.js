import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Animated, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import CustomAlert from '../components/ui/CustomAlert';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [customAlertType, setCustomAlertType] = useState('success');
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const displayCustomAlert = (type, title, message) => {
    setCustomAlertType(type);
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    if (type === 'success') setShowSuccess(true);
    if (type === 'error') setShowError(true);
  };

  const handleDismissAlert = () => {
    setShowSuccess(false);
    setShowError(false);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      // Nettoyage des champs
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      console.log('🔄 Tentative de connexion avec:', cleanEmail);
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      console.log('✅ Réponse de connexion reçue:', res.status);
      const { token } = res.data;
      if (!token) {
        throw new Error('Token manquant dans la réponse');
      }
      // Sauvegarder seulement le token
      await AsyncStorage.setItem('userToken', token);
      // Créer un identifiant unique basé sur l'email pour l'historique
      const userIdentifier = cleanEmail.replace(/[^a-z0-9]/g, '_');
      await AsyncStorage.setItem('userIdentifier', userIdentifier);
      console.log('✅ Connexion réussie, redirection...');
      Keyboard.dismiss();
      displayCustomAlert('success', 'Connexion réussie !', "Redirection vers l'accueil...");
      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      console.log('❌ Erreur de connexion:', error.response?.status, error.response?.data);
      // Gestion spécifique des erreurs
      if (error.response) {
        if (error.response.status === 401) {
          displayCustomAlert('error', 'Identifiants incorrects', 'Email ou mot de passe incorrect');
        } else if (error.response.status === 404) {
          displayCustomAlert('error', 'Service indisponible', 'Le service de connexion est temporairement indisponible');
        } else if (error.response.status === 500) {
          displayCustomAlert('error', 'Erreur serveur', 'Problème temporaire du serveur. Vérifiez vos identifiants et réessayez.');
        } else {
          displayCustomAlert('error', 'Erreur de connexion', 'Veuillez vérifier vos identifiants et réessayer');
        }
      } else if (error.request) {
        displayCustomAlert('error', 'Erreur réseau', 'Vérifiez votre connexion internet');
      } else {
        displayCustomAlert('error', 'Erreur', 'Une erreur inattendue s\'est produite');
      }
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.animatedBackground,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.gradient}
            />
          </Animated.View>

          <ScrollView 
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <View style={styles.logoContainer}>
                <FontAwesome5 name="gas-pump" size={80} color="#4c669f" />
              </View>
              <Text style={styles.title}>MonAppGaz</Text>
              <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={24} color="#4c669f" style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder="Votre email"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={24} color="#4c669f" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#666"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Feather name={showPassword ? 'eye' : 'eye-off'} size={22} color="#4c669f" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Se connecter</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <CustomAlert
            type={customAlertType}
            title={customAlertTitle}
            message={customAlertMessage}
            isVisible={showSuccess || showError}
            onDismiss={handleDismissAlert}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  animatedBackground: {
    position: 'absolute',
    width: '200%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
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
  eyeIcon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#4c669f',
    fontSize: 14,
  },
});
