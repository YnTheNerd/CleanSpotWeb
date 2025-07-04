import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Collections
const COLLECTIONS = {
  SIGNALS: 'signals',
  USER_STATS: 'userStats',
  ADMINS: 'admins',
  COLLECTORS: 'collectors'
};

// Signals functions
export const subscribeToSignals = (callback, filters = {}) => {
  let q = collection(db, COLLECTIONS.SIGNALS);
  
  // Apply filters
  const conditions = [];
  
  if (filters.status) {
    conditions.push(where('status', '==', filters.status));
  }
  
  if (filters.priority) {
    conditions.push(where('priority', '==', filters.priority));
  }
  
  if (filters.startDate) {
    conditions.push(where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    conditions.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
  }
  
  if (filters.assignedTo) {
    conditions.push(where('assignedTo', '==', filters.assignedTo));
  }
  
  // Build query with conditions
  if (conditions.length > 0) {

    q = query(q, ...conditions, orderBy('createdAt', 'desc'));
  } else {
    q = query(q, orderBy('createdAt', 'desc'));
  }
  

  return onSnapshot(q, callback, (error) => {
    console.error('Error in signals subscription:', error);
  });
};


export const getSignals = async (filters = {}, limitCount = 50, lastDoc = null) => {
  try {
    let q = collection(db, COLLECTIONS.SIGNALS);
    const conditions = [];
    
    // Apply filters
    if (filters.status) {
      conditions.push(where('status', '==', filters.status));
    }
    
    if (filters.priority) {
      conditions.push(where('priority', '==', filters.priority));
    }
    
    if (filters.startDate) {
      conditions.push(where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
    }
    
    // Build query
    const queryConditions = [
      ...conditions,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    ];
    
    if (lastDoc) {
      queryConditions.push(startAfter(lastDoc));
    }
    
    q = query(q, ...queryConditions);
    
    const snapshot = await getDocs(q);
    const signals = [];
    
    snapshot.forEach((doc) => {
      signals.push({ id: doc.id, ...doc.data() });
    });
    
    return {
      signals,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === limitCount
    };
  } catch (error) {
    console.error('Error getting signals:', error);
    throw error;
  }
};

export const getSignal = async (signalId) => {
  try {
    const docRef = doc(db, COLLECTIONS.SIGNALS, signalId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Signal not found');
    }
  } catch (error) {
    console.error('Error getting signal:', error);
    throw error;
  }
};

export const updateSignal = async (signalId, updateData) => {
  try {
    await runTransaction(db, async (transaction) => {
      // PHASE 1: ALL READS FIRST (as required by Firestore transactions)
      const signalRef = doc(db, COLLECTIONS.SIGNALS, signalId);
      const signalDoc = await transaction.get(signalRef);
      
      if (!signalDoc.exists()) {
        throw new Error('Signal does not exist');
      }
      



      const currentSignal = signalDoc.data();
      const oldStatus = currentSignal.status;
      const newStatus = updateData.status;
      




      // Prepare update data
      const updatedSignal = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      
      // Add resolvedAt timestamp if status changed to resolved
      if (newStatus === 'resolved' && oldStatus !== 'resolved') {

        updatedSignal.resolvedAt = serverTimestamp();
      }
      

      // Remove resolvedAt if status changed from resolved to something else
      if (oldStatus === 'resolved' && newStatus !== 'resolved') {
        updatedSignal.resolvedAt = null;
      }
      
      // Read user stats if status is changing (read this now, before any writes)
      let userStatsRef = null;
      let userStatsDoc = null;
      let shouldUpdateStats = false;

      if (oldStatus !== newStatus && currentSignal.userId) {
        userStatsRef = doc(db, COLLECTIONS.USER_STATS, currentSignal.userId);
        userStatsDoc = await transaction.get(userStatsRef);
        shouldUpdateStats = true;
      }

      // PHASE 2: ALL WRITES SECOND (after all reads are complete)

      // Write 1: Update signal
      transaction.update(signalRef, updatedSignal);

      // Write 2: Update user stats if status changed
      if (shouldUpdateStats && userStatsDoc && userStatsDoc.exists()) {
        const currentStats = userStatsDoc.data();
        const newStats = { ...currentStats };

        // Decrease old status count
        if (oldStatus === 'pending') newStats.pendingReports = Math.max(0, (newStats.pendingReports || 0) - 1);
        else if (oldStatus === 'in_progress') newStats.inProgressReports = Math.max(0, (newStats.inProgressReports || 0) - 1);
        else if (oldStatus === 'resolved') newStats.resolvedReports = Math.max(0, (newStats.resolvedReports || 0) - 1);

        // Increase new status count
        if (newStatus === 'pending') newStats.pendingReports = (newStats.pendingReports || 0) + 1;
        else if (newStatus === 'in_progress') newStats.inProgressReports = (newStats.inProgressReports || 0) + 1;
        else if (newStatus === 'resolved') newStats.resolvedReports = (newStats.resolvedReports || 0) + 1;

        newStats.updatedAt = serverTimestamp();

        transaction.update(userStatsRef, newStats);
      }
    });
  } catch (error) {
    console.error('Error updating signal:', error);
    throw error;
  }
};


// Collectors functions
export const getCollectors = async () => {
  try {

    const q = query(collection(db, COLLECTIONS.COLLECTORS), orderBy('email'));
    const snapshot = await getDocs(q);
    const collectors = [];
    
    snapshot.forEach((doc) => {
      collectors.push({ id: doc.id, ...doc.data() });
    });
    
    return collectors;
  } catch (error) {

    console.error('Error getting collectors:', error);
    throw error;
  }
};

export const addCollector = async (email) => {
  try {

    // Check if collector already exists
    const q = query(collection(db, COLLECTIONS.COLLECTORS), where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('Collector already exists');
    }
    
    const docRef = await addDoc(collection(db, COLLECTIONS.COLLECTORS), {
      email: email.toLowerCase().trim(),
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding collector:', error);
    throw error;
  }
};


export const removeCollector = async (collectorId) => {
  try {

    await deleteDoc(doc(db, COLLECTIONS.COLLECTORS, collectorId));
  } catch (error) {

    console.error('Error removing collector:', error);
    throw error;
  }
};



// Admin functions
export const checkAdminAccess = async (userId) => {
  try {



    const q = query(collection(db, COLLECTIONS.ADMINS), where('email', '==', userId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

// Statistics functions
export const getSignalStats = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SIGNALS));
    const stats = {







      total: 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      high_priority: 0,
      normal_priority: 0,
      low_priority: 0
    };
    


    snapshot.forEach((doc) => {
      const signal = doc.data();

      stats.total++;
      










      // Count by status
      if (signal.status === 'pending') stats.pending++;
      else if (signal.status === 'in_progress') stats.in_progress++;
      else if (signal.status === 'resolved') stats.resolved++;
      
      // Count by priority
      if (signal.priority === 'high') stats.high_priority++;
      else if (signal.priority === 'normal') stats.normal_priority++;
      else if (signal.priority === 'low') stats.low_priority++;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting signal stats:', error);
    throw error;
  }
};

export const getSignalTrends = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, COLLECTIONS.SIGNALS),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const trends = {};
    
    snapshot.forEach((doc) => {
      const signal = doc.data();
      const date = signal.createdAt.toDate().toDateString();
      
      if (!trends[date]) {
        trends[date] = { date, total: 0, pending: 0, in_progress: 0, resolved: 0 };
      }
      



      trends[date].total++;
      trends[date][signal.status]++;
    });
    





    return Object.values(trends);
  } catch (error) {
    console.error('Error getting signal trends:', error);
    throw error;
  }
};

export const getTopReporters = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USER_STATS),
      orderBy('totalReports', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const reporters = [];
    
    snapshot.forEach((doc) => {
      const stats = doc.data();
      reporters.push({
        userId: doc.id,

        ...stats
      });
    });
    





    return reporters;
  } catch (error) {

    console.error('Error getting top reporters:', error);
    throw error;
  }
};

// Real-time statistics subscription
export const subscribeToStats = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.SIGNALS), (snapshot) => {
    const stats = {
      total: 0,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      high_priority: 0,
      normal_priority: 0,
      low_priority: 0
    };
    
    snapshot.forEach((doc) => {
      const signal = doc.data();
      stats.total++;
      
      // Count by status
      if (signal.status === 'pending') stats.pending++;
      else if (signal.status === 'in_progress') stats.in_progress++;
      else if (signal.status === 'resolved') stats.resolved++;
      
      // Count by priority
      if (signal.priority === 'high') stats.high_priority++;
      else if (signal.priority === 'normal') stats.normal_priority++;
      else if (signal.priority === 'low') stats.low_priority++;
    });
    
    callback(stats);
  }, (error) => {
    console.error('Error in stats subscription:', error);
  });
};