import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { RegistrationLink } from '@/types/telehealth';

// Generate a unique token for registration links
const generateToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export function useRegistrationLinks(professionalId: string) {
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !professionalId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'registrationLinks'),
      where('professionalId', '==', professionalId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RegistrationLink[];
        setLinks(items.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching registration links:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [professionalId]);

  const createLink = useCallback(
    async (expirationHours: number = 48, maxUses: number = 1) => {
      if (!isFirebaseConfigured || !db) return null;

      const now = new Date();
      const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

      const newLink: Omit<RegistrationLink, 'id'> = {
        token: generateToken(),
        professionalId,
        expiresAt: expiresAt.toISOString(),
        maxUses,
        usedCount: 0,
        isActive: true,
        createdAt: now.toISOString(),
      };

      try {
        const docRef = await addDoc(collection(db, 'registrationLinks'), newLink);
        return { id: docRef.id, ...newLink };
      } catch (error) {
        console.error('Error creating registration link:', error);
        throw error;
      }
    },
    [professionalId]
  );

  const deactivateLink = useCallback(async (linkId: string) => {
    if (!isFirebaseConfigured || !db) return;

    try {
      await updateDoc(doc(db, 'registrationLinks', linkId), {
        isActive: false,
      });
    } catch (error) {
      console.error('Error deactivating link:', error);
      throw error;
    }
  }, []);

  const deleteLink = useCallback(async (linkId: string) => {
    if (!isFirebaseConfigured || !db) return;

    try {
      await deleteDoc(doc(db, 'registrationLinks', linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  }, []);

  return {
    links,
    loading,
    createLink,
    deactivateLink,
    deleteLink,
  };
}

// Hook to validate and use a registration link (for patients)
export function useValidateRegistrationLink() {
  const validateLink = useCallback(async (token: string) => {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const q = query(
        collection(db, 'registrationLinks'),
        where('token', '==', token),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;

      const linkDoc = snapshot.docs[0];
      const link = { id: linkDoc.id, ...linkDoc.data() } as RegistrationLink;

      // Check if expired
      if (new Date(link.expiresAt) < new Date()) {
        await updateDoc(doc(db, 'registrationLinks', link.id), {
          isActive: false,
        });
        return null;
      }

      // Check if max uses reached
      if (link.usedCount >= link.maxUses) {
        await updateDoc(doc(db, 'registrationLinks', link.id), {
          isActive: false,
        });
        return null;
      }

      return link;
    } catch (error) {
      console.error('Error validating link:', error);
      return null;
    }
  }, []);

  const markLinkAsUsed = useCallback(async (linkId: string, currentUsedCount: number) => {
    if (!isFirebaseConfigured || !db) return;

    try {
      await updateDoc(doc(db, 'registrationLinks', linkId), {
        usedCount: currentUsedCount + 1,
      });
    } catch (error) {
      console.error('Error marking link as used:', error);
    }
  }, []);

  return { validateLink, markLinkAsUsed };
}
