import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const PlatformStyles = {
  // Styles de base pour les conteneurs
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Styles pour les en-têtes
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  
  // Styles pour les cartes
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  
  // Styles pour les boutons
  button: {
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  // Styles pour les inputs
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  
  // Styles pour les modales
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6.27,
      },
      android: {
        elevation: 8,
      },
    }),
  },
};

// Dimensions responsives
export const ResponsiveDimensions = {
  screenWidth,
  screenHeight,
  isSmallDevice: screenWidth < 375,
  isMediumDevice: screenWidth >= 375 && screenWidth < 414,
  isLargeDevice: screenWidth >= 414,
  
  // Marges adaptatives
  margin: {
    small: screenWidth * 0.02,
    medium: screenWidth * 0.04,
    large: screenWidth * 0.06,
  },
  
  // Padding adaptatifs
  padding: {
    small: screenWidth * 0.03,
    medium: screenWidth * 0.05,
    large: screenWidth * 0.08,
  },
  
  // Tailles de police adaptatives
  fontSize: {
    small: Math.max(12, screenWidth * 0.03),
    medium: Math.max(14, screenWidth * 0.035),
    large: Math.max(16, screenWidth * 0.04),
    xlarge: Math.max(18, screenWidth * 0.045),
    xxlarge: Math.max(24, screenWidth * 0.06),
  },
};

// Couleurs de l'application
export const AppColors = {
  primary: '#4c669f',
  secondary: '#3b5998',
  accent: '#192f6a',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  info: '#2196F3',
  light: '#f5f5f5',
  dark: '#333',
  gray: '#666',
  white: '#fff',
  black: '#000',
  transparent: 'transparent',
}; 