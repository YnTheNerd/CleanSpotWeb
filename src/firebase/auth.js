import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user is an admin
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (!adminDoc.exists()) {
      await signOut(auth);
      throw new Error('Access denied. You are not authorized to access this application.');
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const checkAdminAccess = async (uid) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    const isAdmin = adminDoc.exists();

    if (isAdmin) {
      console.log('Admin access granted for user:', uid);
    } else {
      console.log('Admin access denied - user not found in admins collection:', uid);
    }

    return isAdmin;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false; // Deny access on error for security
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};