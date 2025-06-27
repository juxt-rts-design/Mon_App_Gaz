import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

const { height: windowHeight } = Dimensions.get('window');

const CustomAlert = ({ type, title, message, isVisible, onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onDismiss) onDismiss();
      }, 3000); // L'alerte disparaît après 3 secondes
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) {
    return null;
  }

  const iconName = type === 'success' ? "check-circle" : "exclamation-circle";
  const iconColor = type === 'success' ? "#4CAF50" : "#f44336";
  const backgroundColor = type === 'success' ? styles.successContent : styles.errorContent;

  return (
    <Animatable.View 
      animation="fadeIn" 
      duration={500} 
      style={styles.messageContainer}
    >
      <Animatable.View 
        animation={type === 'success' ? "zoomIn" : "shake"} 
        duration={500} 
        style={[styles.messageContent, backgroundColor]}
      >
        <FontAwesome5 name={iconName} size={50} color={iconColor} />
        <Text style={styles.messageText}>{title}</Text>
        {message && <Text style={styles.messageSubText}>{message}</Text>}
      </Animatable.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: windowHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  messageContent: {
    backgroundColor: 'white',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
    minWidth: 220,
    maxWidth: 340,
    width: '90%',
    maxHeight: '60%',
  },
  successContent: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  errorContent: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  messageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  messageSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default CustomAlert; 