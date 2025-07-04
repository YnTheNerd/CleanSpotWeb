// French localization for CleanSpot Web Application
// Localizes UI elements for French-speaking users in Yaoundé, Cameroon

export const translations = {
  // Status labels
  status: {
    pending: 'en attente',
    in_progress: 'en cours', 
    resolved: 'résolu'
  },

  // Priority levels
  priority: {
    high: 'élevée',
    normal: 'normale',
    low: 'faible'
  },

  // Navigation and main sections
  navigation: {
    dashboard: 'Dashboard', // Keep technical term in English
    heatmap: 'Heatmap', // Keep technical term in English
    statistics: 'Statistiques',
    collectors: 'Collecteurs',
    logout: 'Déconnexion'
  },

  // Buttons and actions
  buttons: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    showMore: 'Voir plus',
    showLess: 'Voir moins',
    close: 'Fermer',
    filter: 'Filtrer',
    reset: 'Réinitialiser',
    assign: 'Assigner',
    unassign: 'Désassigner'
  },

  // Form labels and fields
  form: {
    description: 'Description',
    location: 'Localisation',
    reporter: 'Rapporteur',
    adminNotes: 'Notes administratives',
    assignedTo: 'Assigné à',
    locationDetails: 'Détails de localisation',
    coordinates: 'Coordonnées',
    address: 'Adresse',
    status: 'Statut',
    priority: 'Priorité',
    createdAt: 'Créé le',
    updatedAt: 'Mis à jour le',
    resolvedAt: 'Résolu le'
  },

  // Main page titles and descriptions
  pages: {
    dashboard: {
      title: 'CleanSpot Admin Dashboard', // Keep brand name
      subtitle: 'Surveillez et gérez les signalements de déchets rapportés par les citoyens à Yaoundé'
    },
    signals: {
      title: 'Signalements de Déchets',
      subtitle: 'Gérez tous les signalements de déchets sauvages',
      noSignals: 'Aucun signalement trouvé',
      totalSignals: 'Total des signalements'
    },
    statistics: {
      title: 'Statistiques',
      subtitle: 'Aperçu des performances et tendances des signalements'
    },
    collectors: {
      title: 'Collecteurs',
      subtitle: 'Gérez l\'équipe de collecteurs de déchets'
    },
    heatmap: {
      title: 'Heatmap', // Keep technical term
      subtitle: 'Carte interactive montrant la répartition des signalements de déchets à travers Yaoundé'
    }
  },

  // Filter options
  filters: {
    allStatuses: 'Tous les statuts',
    allPriorities: 'Toutes les priorités',
    dateRange: 'Période',
    searchPlaceholder: 'Rechercher des signalements...'
  },

  // Modal and dialog text
  modal: {
    signalDetails: 'Détails du signalement',
    information: 'Informations',
    basicInfo: 'Informations de base',
    noDescription: 'Aucune description fournie',
    noAdminNotes: 'Aucune note administrative',
    unassigned: 'Non assigné',
    noAddress: 'Aucune adresse',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce signalement ?',
    deleteWarning: 'Cette action ne peut pas être annulée.'
  },

  // Messages and notifications
  messages: {
    loading: 'Chargement...',
    saving: 'Enregistrement...',
    saved: 'Enregistré avec succès',
    error: 'Une erreur s\'est produite',
    updateSuccess: 'Signalement mis à jour avec succès',
    updateError: 'Erreur lors de la mise à jour du signalement',
    deleteSuccess: 'Signalement supprimé avec succès',
    deleteError: 'Erreur lors de la suppression du signalement',
    noData: 'Aucune donnée disponible',
    connectionError: 'Erreur de connexion'
  },

  // View modes
  viewModes: {
    list: 'Liste',
    card: 'Cartes',
    details: 'Détails'
  },

  // Time and date
  time: {
    reported: 'Signalé',
    updated: 'Mis à jour',
    resolved: 'Résolu',
    ago: 'il y a',
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois-ci'
  },

  // Statistics labels
  stats: {
    totalReports: 'Total des signalements',
    pendingReports: 'Signalements en attente',
    inProgressReports: 'Signalements en cours',
    resolvedReports: 'Signalements résolus',
    averageResolutionTime: 'Temps de résolution moyen',
    responseRate: 'Taux de réponse',
    activeCollectors: 'Collecteurs actifs'
  }
};

// Helper function to get translated text
export const t = (key, fallback = key) => {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback;
    }
  }
  
  return typeof value === 'string' ? value : fallback;
};

// Helper function to get status display text
export const getStatusText = (status) => {
  return t(`status.${status}`, status);
};

// Helper function to get priority display text  
export const getPriorityText = (priority) => {
  return t(`priority.${priority}`, priority);
};

// Helper function to format status for display (capitalize first letter)
export const formatStatusText = (status) => {
  const translated = getStatusText(status);
  return translated.charAt(0).toUpperCase() + translated.slice(1);
};

// Helper function to format priority for display (capitalize first letter)
export const formatPriorityText = (priority) => {
  const translated = getPriorityText(priority);
  return translated.charAt(0).toUpperCase() + translated.slice(1);
};
