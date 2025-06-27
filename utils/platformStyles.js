import { Platform } from 'react-native';

/**
 * Crée des styles d'ombre compatibles avec iOS et Android
 * @param {Object} options - Options pour l'ombre
 * @param {string} options.shadowColor - Couleur de l'ombre
 * @param {number} options.shadowOffsetX - Décalage horizontal
 * @param {number} options.shadowOffsetY - Décalage vertical
 * @param {number} options.shadowOpacity - Opacité de l'ombre
 * @param {number} options.shadowRadius - Rayon de l'ombre
 * @param {number} options.elevation - Élévation pour Android
 * @returns {Object} Styles d'ombre pour la plateforme
 */
export const createShadowStyle = ({
  shadowColor = '#000',
  shadowOffsetX = 0,
  shadowOffsetY = 2,
  shadowOpacity = 0.25,
  shadowRadius = 3.84,
  elevation = 5
}) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor,
      shadowOffset: {
        width: shadowOffsetX,
        height: shadowOffsetY,
      },
      shadowOpacity,
      shadowRadius,
    };
  } else {
    return {
      elevation,
      shadowColor,
    };
  }
};

/**
 * Crée des styles de bordure arrondie avec ombre
 * @param {number} borderRadius - Rayon de la bordure
 * @param {Object} shadowOptions - Options pour l'ombre
 * @returns {Object} Styles combinés
 */
export const createCardStyle = (borderRadius = 10, shadowOptions = {}) => {
  return {
    borderRadius,
    backgroundColor: 'white',
    ...createShadowStyle(shadowOptions),
  };
};

/**
 * Styles spécifiques à la plateforme pour les boutons
 */
export const buttonStyles = {
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
    elevation: 5,
  },
};

/**
 * Styles spécifiques à la plateforme pour les cartes
 */
export const cardStyles = {
  ios: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  android: {
    elevation: 2,
  },
}; 