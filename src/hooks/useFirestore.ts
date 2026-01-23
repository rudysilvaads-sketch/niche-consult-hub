import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Patient,
  Appointment,
  ConsultationRecord,
  Transaction,
  ServicePackage,
  Document,
} from '@/types';

// Helper to convert Firestore timestamps
const convertTimestamp = (data: any) => {
  const result = { ...data };
  Object.keys(result).forEach((key) => {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate().toISOString().split('T')[0];
    }
  });
  return result;
};

export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...convertTimestamp(doc.data()),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  const add = useCallback(
    async (item: Omit<T, 'id'>) => {
      try {
        const docRef = await addDoc(collection(db, collectionName), {
          ...item,
          createdAt: new Date().toISOString(),
        });
        return { id: docRef.id, ...item } as T;
      } catch (err) {
        console.error(`Error adding to ${collectionName}:`, err);
        throw err;
      }
    },
    [collectionName]
  );

  const update = useCallback(
    async (id: string, updates: Partial<T>) => {
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updates as any);
      } catch (err) {
        console.error(`Error updating ${collectionName}:`, err);
        throw err;
      }
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error(`Error deleting from ${collectionName}:`, err);
        throw err;
      }
    },
    [collectionName]
  );

  return { data, loading, error, add, update, remove };
}

// Type-safe hooks for each collection
export function usePatients() {
  return useFirestoreCollection<Patient>('patients');
}

export function useAppointments() {
  return useFirestoreCollection<Appointment>('appointments');
}

export function useRecords() {
  return useFirestoreCollection<ConsultationRecord>('records');
}

export function useTransactions() {
  return useFirestoreCollection<Transaction>('transactions');
}

export function usePackages() {
  return useFirestoreCollection<ServicePackage>('packages');
}

export function useDocuments() {
  return useFirestoreCollection<Document>('documents');
}
