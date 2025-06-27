import React from 'react';
import { Platform, StatusBar, View } from 'react-native';

/**
 * Composant pour gérer la barre de statut de manière cross-platform
 * @param {Object} props - Propriétés du composant
 * @param {string} props.backgroundColor - Couleur de fond de la barre de statut
 * @param {string} props.barStyle - Style de la barre (light-content, dark-content, default)
 * @param {boolean} props.translucent - Si la barre doit être translucide (Android uniquement)
 */
export default function StatusBarManager({ 
  backgroundColor = 'transparent', 
  barStyle = 'light-content',
  translucent = false 
}) {
  if (Platform.OS === 'ios') {
    return (
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        translucent={false}
      />
    );
  } else {
    return (
      <View style={{ height: translucent ? 0 : StatusBar.currentHeight }}>
        <StatusBar
          barStyle={barStyle}
          backgroundColor={backgroundColor}
          translucent={translucent}
        />
      </View>
    );
  }
} 