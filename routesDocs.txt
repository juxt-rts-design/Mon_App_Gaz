/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentification des utilisateurs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Enregistrement d'un nouvel utilisateur
 *     description: |
 *       Permet de créer un nouveau compte utilisateur.
 *       Le premier utilisateur enregistré devient automatiquement administrateur.
 *       Les suivants doivent être créés par un admin.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "MotDePasse123"
 *               role:
 *                 type: string
 *                 enum: [admin, controller, driver]
 *                 description: |
 *                   Optionnel - Seul un admin peut spécifier ce champ.
 *                   Par défaut "driver" si non spécifié.
 *                 example: "driver"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: |
 *           Erreur de validation ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email déjà utilisé"
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Authentification avec email et mot de passe
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MotDePasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email ou mot de passe incorrect"
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     description: Renvoie les informations de l'utilisateur actuellement authentifié
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Changer le mot de passe
 *     description: Permet à un utilisateur de changer son mot de passe
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "AncienMotDePasse123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "NouveauMotDePasse456"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mot de passe mis à jour avec succès"
 *       400:
 *         description: |
 *           Mot de passe actuel incorrect ou nouveau mot de passe invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mot de passe actuel incorrect"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 5f8d0f3d4b3c2a1e0c9b8a7d
 *         name:
 *           type: string
 *           example: Jean Dupont
 *         email:
 *           type: string
 *           example: jean@example.com
 *         role:
 *           type: string
 *           enum: [admin, controller, driver]
 *           example: driver
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Truck:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 5f8d0f3d4b3c2a1e0c9b8a7e
 *         name:
 *           type: string
 *           example: Camion 1
 *         licensePlate:
 *           type: string
 *           example: AB-123-CD
 *         capacity:
 *           type: number
 *           example: 100
 *         status:
 *           type: string
 *           enum: [disponible, en livraison, en maintenance]
 *           example: disponible
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Delivery:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 5f8d0f3d4b3c2a1e0c9b8a7f
 *         driver:
 *           $ref: '#/components/schemas/User'
 *         truck:
 *           $ref: '#/components/schemas/Truck'
 *         fullBottlesSent:
 *           type: number
 *           example: 50
 *         emptyBottlesSent:
 *           type: number
 *           example: 20
 *         status:
 *           type: string
 *           enum: [en cours, terminée, annulée]
 *           example: en cours
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     Stock:
 *       type: object
 *       properties:
 *         fullBottles:
 *           type: number
 *           example: 500
 *         emptyBottles:
 *           type: number
 *           example: 200
 *         consignedBottles:
 *           type: number
 *           example: 100
 * 
 *     StockMovement:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [entrée, sortie]
 *           example: entrée
 *         fullBottles:
 *           type: number
 *           example: 50
 *         emptyBottles:
 *           type: number
 *           example: 20
 *         description:
 *           type: string
 *           example: "Livraison initiale"
 * 
 *     Salary:
 *       type: object
 *       properties:
 *         driver:
 *           $ref: '#/components/schemas/User'
 *         totalDeliveries:
 *           type: number
 *           example: 10
 *         totalBottlesSold:
 *           type: number
 *           example: 500
 *         salaryAmount:
 *           type: number
 *           example: 2500
 *         status:
 *           type: string
 *           enum: [en attente, payé]
 *           example: en attente
 * 
 *     Notification:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [stock, livraison, salaire]
 *           example: stock
 *         message:
 *           type: string
 *           example: "Stock critique de bouteilles pleines"
 *         isRead:
 *           type: boolean
 *           example: false
 * 
 *   responses:
 *     UnauthorizedError:
 *       description: Token d'accès manquant ou invalide
 *     ForbiddenError:
 *       description: Accès refusé - permissions insuffisantes
 *     NotFoundError:
 *       description: Ressource non trouvée
 *     ValidationError:
 *       description: Erreur de validation des données
 */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestion des utilisateurs (admin uniquement)
 *   - name: Trucks
 *     description: Gestion des camions
 *   - name: Stock
 *     description: Gestion du stock et des mouvements
 *   - name: Deliveries
 *     description: Gestion des livraisons
 *   - name: Salaries
 *     description: Gestion des salaires
 *   - name: Stats
 *     description: Statistiques globales
 *   - name: Notifications
 *     description: Gestion des notifications
 *   - name: Logs
 *     description: Historique des actions
 */

// ==============================================
// Routes des utilisateurs
// ==============================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     description: Seul un administrateur peut voir tous les utilisateurs
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     description: Seul un administrateur peut modifier un utilisateur
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 * 
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Seul un administrateur peut supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       204:
 *         description: Utilisateur supprimé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ==============================================
// Routes des camions
// ==============================================

/**
 * @swagger
 * /api/trucks:
 *   post:
 *     summary: Ajouter un camion
 *     description: Seul un administrateur peut ajouter un camion
 *     tags: [Trucks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Truck'
 *     responses:
 *       201:
 *         description: Camion créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Truck'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 * 
 *   get:
 *     summary: Lister tous les camions
 *     description: Tous les utilisateurs authentifiés peuvent voir les camions
 *     tags: [Trucks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des camions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Truck'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/trucks/{id}:
 *   put:
 *     summary: Mettre à jour un camion
 *     description: Seul un administrateur peut modifier un camion
 *     tags: [Trucks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du camion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Truck'
 *     responses:
 *       200:
 *         description: Camion mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Truck'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 * 
 *   delete:
 *     summary: Supprimer un camion
 *     description: Seul un administrateur peut supprimer un camion
 *     tags: [Trucks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du camion
 *     responses:
 *       204:
 *         description: Camion supprimé
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ==============================================
// Routes du stock
// ==============================================

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Voir l'état du stock
 *     description: Tous les utilisateurs authentifiés peuvent voir le stock
 *     tags: [Stock]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: État du stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 *   put:
 *     summary: Mettre à jour le stock
 *     description: Seuls les administrateurs et contrôleurs peuvent modifier le stock
 *     tags: [Stock]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockMovement'
 *     responses:
 *       200:
 *         description: Stock mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stock'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/stock/movements:
 *   get:
 *     summary: Voir l'historique des mouvements de stock
 *     description: Tous les utilisateurs authentifiés peuvent voir l'historique
 *     tags: [Stock]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des mouvements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StockMovement'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// ==============================================
// Routes des livraisons
// ==============================================

/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Créer une livraison
 *     description: Seuls les administrateurs et contrôleurs peuvent créer une livraison
 *     tags: [Deliveries]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Delivery'
 *     responses:
 *       201:
 *         description: Livraison créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/deliveries/{id}:
 *   put:
 *     summary: Mettre à jour une livraison
 *     description: Seuls les contrôleurs peuvent modifier une livraison
 *     tags: [Deliveries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la livraison
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Delivery'
 *     responses:
 *       200:
 *         description: Livraison mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ==============================================
// Routes des salaires
// ==============================================

/**
 * @swagger
 * /api/salaries:
 *   get:
 *     summary: Lister tous les salaires
 *     description: Seul un administrateur peut voir tous les salaires
 *     tags: [Salaries]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des salaires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Salary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/salaries/calculate/{driverId}:
 *   post:
 *     summary: Calculer le salaire d'un chauffeur
 *     description: Seul un administrateur peut calculer un salaire
 *     tags: [Salaries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du chauffeur
 *     responses:
 *       200:
 *         description: Salaire calculé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Salary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/salaries/pay/{id}:
 *   put:
 *     summary: Marquer un salaire comme payé
 *     description: Seul un administrateur peut marquer un salaire comme payé
 *     tags: [Salaries]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du salaire
 *     responses:
 *       200:
 *         description: Salaire marqué comme payé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Salary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ==============================================
// Routes des statistiques
// ==============================================

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Voir les statistiques globales
 *     description: Seuls les administrateurs et contrôleurs peuvent voir les stats
 *     tags: [Stats]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDeliveries:
 *                   type: number
 *                   example: 150
 *                 totalBottlesSold:
 *                   type: number
 *                   example: 7500
 *                 totalDrivers:
 *                   type: number
 *                   example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

// ==============================================
// Routes des notifications
// ==============================================

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Lister toutes les notifications
 *     description: Tous les utilisateurs authentifiés peuvent voir leurs notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 *   post:
 *     summary: Créer une notification manuellement
 *     description: Seul un administrateur peut créer une notification manuellement
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Marquer une notification comme lue
 *     description: L'utilisateur peut marquer ses notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ==============================================
// Routes des logs
// ==============================================

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Voir l'historique des actions
 *     description: Seul un administrateur peut voir l'historique des actions
 *     tags: [Logs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des actions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   action:
 *                     type: string
 *                     example: "Modification du stock"
 *                   target:
 *                     type: string
 *                     example: "Stock"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */