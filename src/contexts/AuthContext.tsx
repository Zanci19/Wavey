import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserStatus: (status: 'online' | 'offline' | 'idle' | 'dnd') => Promise<void>;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status: 'online' | 'offline' | 'idle' | 'dnd';
  statusText: string;
  lastSeen: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      photoURL: userCredential.user.photoURL || '',
      status: 'online',
      statusText: 'Hey there! I am using Wavey.',
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (currentUser) {
      // Update status to offline before logging out
      await updateDoc(doc(db, 'users', currentUser.uid), {
        status: 'offline',
        lastSeen: serverTimestamp()
      });
    }
    await signOut(auth);
  };

  const updateUserStatus = async (status: 'online' | 'offline' | 'idle' | 'dnd') => {
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        status,
        lastSeen: serverTimestamp()
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
          
          // Update user status to online
          await updateDoc(doc(db, 'users', user.uid), {
            status: 'online',
            lastSeen: serverTimestamp()
          });
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    updateUserStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
