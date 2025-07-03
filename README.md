# 🚛 MonAppGaz - Application Mobile de Gestion de Livraisons

<div align="center">

![MonAppGaz Logo](assets/images/icon.png)

**Application mobile React Native/Expo pour la gestion de livraisons de gaz**

[![React Native](https://img.shields.io/badge/React%20Native-0.79.3-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.11-black.svg)](https://expo.dev/)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📱 À propos de MonAppGaz

MonAppGaz est une application mobile moderne développée avec **React Native** et **Expo** pour la gestion complète des livraisons de gaz. L'application offre une interface intuitive permettant aux utilisateurs de gérer leurs stocks, créer et suivre des livraisons, et consulter l'historique des opérations.

### ✨ Fonctionnalités principales

- 🔐 **Authentification sécurisée** avec JWT
- 📊 **Tableau de bord** interactif avec vue d'ensemble
- 📦 **Gestion des stocks** en temps réel
- 🚚 **Création et suivi de livraisons**
- 📋 **Historique complet** des opérations
- 🔔 **Système de notifications** en temps réel
- 🌐 **Mode hors ligne** avec synchronisation automatique
- 📱 **Interface adaptative** iOS et Android

---

## 🛠️ Technologies utilisées

### Frontend
- **React Native** 0.79.3 - Framework mobile cross-platform
- **Expo** 53.0.11 - Plateforme de développement React Native
- **React Navigation** - Navigation entre écrans
- **Axios** - Client HTTP pour les API
- **AsyncStorage** - Stockage local des données
- **React Native Reanimated** - Animations fluides

### UI/UX
- **Expo Vector Icons** - Icônes vectorielles
- **Linear Gradient** - Effets de dégradé
- **React Native Chart Kit** - Graphiques et visualisations
- **Expo Haptics** - Retour haptique
- **React Native Animatable** - Animations avancées

### Backend & API
- **API RESTful** - Communication avec le serveur
- **JWT Authentication** - Authentification sécurisée
- **Offline Support** - Synchronisation hors ligne

---

## 📋 Prérequis

- **Node.js** (version 16 ou supérieure)
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (pour Android)
- **Xcode** (pour iOS, macOS uniquement)

---

## 🚀 Installation et configuration

### 1. Cloner le repository
```bash
git clone https://github.com/juxt-rts-design/Mon_App_Gaz.git
cd Mon_App_Gaz
```

### 2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

### 3. Configuration de l'environnement
Créez un fichier `.env` à la racine du projet :
```env
API_URL=http://localhost:5000
```

### 4. Lancer l'application

#### Mode développement
```bash
npm start
# ou
expo start
```

#### Plateformes spécifiques
```bash
# Android
npm run android
# ou
expo run:android

# iOS
npm run ios
# ou
expo run:ios

# Web
npm run web
# ou
expo start --web
```

---

## 📱 Structure de l'application

```
MonAppGaz/
├── 📁 android/                 # Configuration Android native
├── 📁 assets/                  # Images, icônes, polices
├── 📁 components/              # Composants réutilisables
│   ├── 📁 ui/                  # Composants UI personnalisés
│   └── ...                     # Autres composants
├── 📁 constants/               # Constantes et styles
├── 📁 hooks/                   # Hooks React personnalisés
├── 📁 screens/                 # Écrans de l'application
│   ├── 📄 Dashboard.js         # Tableau de bord principal
│   ├── 📄 LoginScreen.js       # Écran de connexion
│   ├── 📄 StockScreen.js       # Gestion des stocks
│   ├── 📄 CreateDeliveryScreen.js # Création de livraison
│   ├── 📄 UpdateDeliveryScreen.js # Modification de livraison
│   ├── 📄 HistoryScreen.js     # Historique des opérations
│   └── 📄 NotificationsScreen.js # Notifications
├── 📁 services/                # Services API
│   └── 📄 api.js               # Configuration Axios
├── 📁 utils/                   # Utilitaires
├── 📄 App.js                   # Point d'entrée principal
├── 📄 package.json             # Dépendances et scripts
└── 📄 app.json                 # Configuration Expo
```

---

## 🔧 Fonctionnalités détaillées

### 🔐 Authentification
- Connexion sécurisée avec email/mot de passe
- Gestion des tokens JWT
- Persistance de session
- Gestion des erreurs de connexion

### 📊 Tableau de bord
- Vue d'ensemble des camions disponibles
- Accès rapide aux fonctionnalités principales
- Compteur de notifications non lues
- Interface avec dégradés et animations

### 📦 Gestion des stocks
- Consultation des stocks en temps réel
- Interface intuitive pour la gestion
- Synchronisation avec le serveur

### 🚚 Livraisons
- Création de nouvelles livraisons
- Modification des livraisons existantes
- Suivi en temps réel
- Mode hors ligne avec synchronisation

### 📋 Historique
- Consultation de l'historique complet
- Filtrage et recherche
- Interface optimisée pour la consultation

### 🔔 Notifications
- Système de notifications en temps réel
- Compteur de notifications non lues
- Gestion des notifications push

---

## 🌐 Mode hors ligne

L'application inclut un système de synchronisation hors ligne avancé :

- **Mise en file d'attente** des requêtes en mode hors ligne
- **Synchronisation automatique** lors du retour de connexion
- **Gestion intelligente** des erreurs réseau
- **Persistance des données** locales

---

## 📱 Optimisations Android

Le projet inclut des optimisations spécifiques pour Android :

- **Gestion des ombres** cross-platform
- **Composants UI optimisés** pour Material Design
- **Performance améliorée** avec `removeClippedSubviews`
- **Feedback tactile** approprié
- **Intégration système** optimale

Voir le fichier `ANDROID_OPTIMIZATIONS.md` pour plus de détails.

---

## 🔧 Scripts disponibles

```bash
# Démarrage en mode développement
npm start

# Lancement sur Android
npm run android

# Lancement sur iOS
npm run ios

# Lancement sur Web
npm run web

# Linting du code
npm run lint

# Reset du projet
npm run reset-project
```

---

## 📦 Dépendances principales

### Production
- `expo` - Plateforme de développement
- `react-native` - Framework mobile
- `@react-navigation/*` - Navigation
- `axios` - Client HTTP
- `@react-native-async-storage/async-storage` - Stockage local
- `react-native-chart-kit` - Graphiques
- `expo-linear-gradient` - Effets de dégradé

### Développement
- `@babel/core` - Transpileur JavaScript
- `eslint` - Linting du code
- `typescript` - Support TypeScript

---

## 🚀 Déploiement

### Build pour production

#### Android
```bash
expo build:android
# ou
eas build --platform android
```

#### iOS
```bash
expo build:ios
# ou
eas build --platform ios
```

### Configuration EAS
Le projet est configuré avec EAS Build pour le déploiement automatisé.

---

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **juxt-rts-design** - *Développement initial* - [GitHub](https://github.com/juxt-rts-design)

---

## 🙏 Remerciements

- [Expo](https://expo.dev/) pour la plateforme de développement
- [React Native](https://reactnative.dev/) pour le framework mobile
- [React Navigation](https://reactnavigation.org/) pour la navigation
- Tous les contributeurs et la communauté open source

---

## 📞 Support

Pour toute question ou problème :
- Ouvrez une [issue](https://github.com/juxt-rts-design/Mon_App_Gaz/issues)
- Contactez-nous via GitHub

---

<div align="center">

**MonAppGaz** - Gestion de livraisons simplifiée 🚛

</div>
