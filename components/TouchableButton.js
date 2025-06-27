import React from 'react';
import { Platform, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';

/**
 * Composant bouton tactile optimisé pour iOS et Android
 * Utilise TouchableNativeFeedback sur Android pour un meilleur feedback
 */
export default function TouchableButton({ 
  children, 
  style, 
  onPress, 
  disabled = false,
  activeOpacity = 0.8,
  rippleColor = 'rgba(0, 0, 0, 0.1)',
  ...props 
}) {
  if (Platform.OS === 'android') {
    return (
      <View style={style}>
        <TouchableNativeFeedback
          onPress={onPress}
          disabled={disabled}
          background={TouchableNativeFeedback.Ripple(rippleColor, false)}
          {...props}
        >
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </TouchableNativeFeedback>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
} 