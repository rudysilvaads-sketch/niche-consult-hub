import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  Patient,
  Appointment,
  ConsultationRecord,
  Transaction,
  ServicePackage,
  Document,
  DashboardStats,
} from '@/types';
import { mockPatients, mockAppointments, mockRecords, mockTransactions, mockPackages, mockDocuments } from '@/data/mockData';

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

export function useAppData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Use imported isFirebaseConfigured from firebase.ts

  // Subscribe to Firestore collections
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Fallback to mock data if Firebase not configured
      setPatients(mockPatients);
      setAppointments(mockAppointments);
      setRecords(mockRecords);
      setTransactions(mockTransactions);
      setPackages(mockPackages);
      setDocuments(mockDocuments);
      setLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    const subscribeToCollection = <T extends { id: string }>(
      collectionName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      fallbackData: T[]
    ) => {
      try {
        if (!db) {
          setter(fallbackData);
          return;
        }
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (snapshot.empty && !firebaseConnected) {
              // Use mock data if collection is empty on first load
              setter(fallbackData);
            } else {
              const items = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...convertTimestamp(doc.data()),
              })) as T[];
              setter(items);
              setFirebaseConnected(true);
            }
            setLoading(false);
          },
          (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
            setter(fallbackData);
            setLoading(false);
          }
        );
        unsubscribers.push(unsubscribe);
      } catch (error) {
        console.error(`Error setting up ${collectionName} subscription:`, error);
        setter(fallbackData);
      }
    };

    subscribeToCollection('patients', setPatients, mockPatients);
    subscribeToCollection('appointments', setAppointments, mockAppointments);
    subscribeToCollection('records', setRecords, mockRecords);
    subscribeToCollection('transactions', setTransactions, mockTransactions);
    subscribeToCollection('packages', setPackages, mockPackages);
    subscribeToCollection('documents', setDocuments, mockDocuments);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isFirebaseConfigured, firebaseConnected]);

  // Patient CRUD
  const addPatient = useCallback(async (patient: Partial<Patient>) => {
    const newPatient: Omit<Patient, 'id'> = {
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate || '',
      cpf: patient.cpf || '',
      address: patient.address,
      notes: patient.notes,
      status: patient.status || 'ativo',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'patients'), newPatient);
        return { id: docRef.id, ...newPatient };
      } catch (error) {
        console.error('Error adding patient:', error);
        throw error;
      }
    } else {
      const localPatient = { id: Date.now().toString(), ...newPatient };
      setPatients((prev) => [...prev, localPatient]);
      return localPatient;
    }
  }, [isFirebaseConfigured]);

  const updatePatient = useCallback(async (id: string, updates: Partial<Patient>) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'patients', id), updates);
      } catch (error) {
        console.error('Error updating patient:', error);
        throw error;
      }
    } else {
      setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  }, [isFirebaseConfigured]);

  const deletePatient = useCallback(async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'patients', id));
      } catch (error) {
        console.error('Error deleting patient:', error);
        throw error;
      }
    } else {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    }
  }, [isFirebaseConfigured]);

  // Appointment CRUD
  const addAppointment = useCallback(async (appointment: Partial<Appointment>) => {
    const newAppointment: Omit<Appointment, 'id'> = {
      patientId: appointment.patientId || '',
      patientName: appointment.patientName || '',
      professionalId: '1',
      date: appointment.date || '',
      time: appointment.time || '',
      duration: appointment.duration || 60,
      status: appointment.status || 'agendado',
      type: appointment.type || '',
      notes: appointment.notes,
      value: appointment.value,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'appointments'), newAppointment);
        return { id: docRef.id, ...newAppointment };
      } catch (error) {
        console.error('Error adding appointment:', error);
        throw error;
      }
    } else {
      const localAppointment = { id: Date.now().toString(), ...newAppointment };
      setAppointments((prev) => [...prev, localAppointment]);
      return localAppointment;
    }
  }, [isFirebaseConfigured]);

  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'appointments', id), updates);
      } catch (error) {
        console.error('Error updating appointment:', error);
        throw error;
      }
    } else {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    }
  }, [isFirebaseConfigured]);

  const deleteAppointment = useCallback(async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
      } catch (error) {
        console.error('Error deleting appointment:', error);
        throw error;
      }
    } else {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }
  }, [isFirebaseConfigured]);

  // Record CRUD
  const addRecord = useCallback(async (record: Partial<ConsultationRecord>) => {
    const newRecord: Omit<ConsultationRecord, 'id'> = {
      appointmentId: record.appointmentId || '',
      patientId: record.patientId || '',
      patientName: record.patientName || '',
      date: record.date || new Date().toISOString().split('T')[0],
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      observations: record.observations,
      prescriptions: record.prescriptions,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'records'), newRecord);
        return { id: docRef.id, ...newRecord };
      } catch (error) {
        console.error('Error adding record:', error);
        throw error;
      }
    } else {
      const localRecord = { id: Date.now().toString(), ...newRecord };
      setRecords((prev) => [...prev, localRecord]);
      return localRecord;
    }
  }, [isFirebaseConfigured]);

  const updateRecord = useCallback(async (id: string, updates: Partial<ConsultationRecord>) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'records', id), updates);
      } catch (error) {
        console.error('Error updating record:', error);
        throw error;
      }
    } else {
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    }
  }, [isFirebaseConfigured]);

  const deleteRecord = useCallback(async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'records', id));
      } catch (error) {
        console.error('Error deleting record:', error);
        throw error;
      }
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  }, [isFirebaseConfigured]);

  // Transaction CRUD
  const addTransaction = useCallback(async (transaction: Partial<Transaction>) => {
    const newTransaction: Omit<Transaction, 'id'> = {
      type: transaction.type || 'receita',
      category: transaction.category || 'consulta',
      description: transaction.description || '',
      value: transaction.value || 0,
      date: transaction.date || new Date().toISOString().split('T')[0],
      patientId: transaction.patientId,
      patientName: transaction.patientName,
      appointmentId: transaction.appointmentId,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status || 'pendente',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
        return { id: docRef.id, ...newTransaction };
      } catch (error) {
        console.error('Error adding transaction:', error);
        throw error;
      }
    } else {
      const localTransaction = { id: Date.now().toString(), ...newTransaction };
      setTransactions((prev) => [...prev, localTransaction]);
      return localTransaction;
    }
  }, [isFirebaseConfigured]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'transactions', id), updates);
      } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }
    } else {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }
  }, [isFirebaseConfigured]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
      }
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  }, [isFirebaseConfigured]);

  // Package CRUD
  const addPackage = useCallback(async (pkg: Partial<ServicePackage>) => {
    const newPackage: Omit<ServicePackage, 'id'> = {
      name: pkg.name || '',
      description: pkg.description,
      sessions: pkg.sessions || 1,
      value: pkg.value || 0,
      validity: pkg.validity || 30,
      isActive: pkg.isActive ?? true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'packages'), newPackage);
        return { id: docRef.id, ...newPackage };
      } catch (error) {
        console.error('Error adding package:', error);
        throw error;
      }
    } else {
      const localPackage = { id: Date.now().toString(), ...newPackage };
      setPackages((prev) => [...prev, localPackage]);
      return localPackage;
    }
  }, [isFirebaseConfigured]);

  const updatePackage = useCallback(async (id: string, updates: Partial<ServicePackage>) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'packages', id), updates);
      } catch (error) {
        console.error('Error updating package:', error);
        throw error;
      }
    } else {
      setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  }, [isFirebaseConfigured]);

  const deletePackage = useCallback(async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'packages', id));
      } catch (error) {
        console.error('Error deleting package:', error);
        throw error;
      }
    } else {
      setPackages((prev) => prev.filter((p) => p.id !== id));
    }
  }, [isFirebaseConfigured]);

  // Document CRUD
  const addDocument = useCallback(async (docData: Partial<Document>) => {
    const newDocument: Omit<Document, 'id'> = {
      type: docData.type || 'recibo',
      patientId: docData.patientId || '',
      patientName: docData.patientName || '',
      appointmentId: docData.appointmentId,
      title: docData.title || '',
      content: docData.content || '',
      date: docData.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'documents'), newDocument);
        return { id: docRef.id, ...newDocument };
      } catch (error) {
        console.error('Error adding document:', error);
        throw error;
      }
    } else {
      const localDocument = { id: Date.now().toString(), ...newDocument };
      setDocuments((prev) => [...prev, localDocument]);
      return localDocument;
    }
  }, [isFirebaseConfigured]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'documents', id), updates);
      } catch (error) {
        console.error('Error updating document:', error);
        throw error;
      }
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    }
  }, [isFirebaseConfigured]);

  const deleteDocument = useCallback(async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'documents', id));
      } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  }, [isFirebaseConfigured]);

  // Calculate stats using useMemo
  const stats = useMemo<DashboardStats>(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthRevenue = monthTransactions
      .filter((t) => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.value, 0);

    const monthExpenses = monthTransactions
      .filter((t) => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + t.value, 0);

    const pendingPayments = transactions
      .filter((t) => t.type === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.value, 0);

    return {
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      todayAppointments: appointments.filter(
        (a) => a.date === new Date().toISOString().split('T')[0]
      ).length,
      weekAppointments: appointments.filter((a) => {
        const appointmentDate = new Date(a.date);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return appointmentDate >= today && appointmentDate <= weekFromNow;
      }).length,
      completedThisMonth: appointments.filter((a) => a.status === 'concluido').length,
      canceledThisMonth: appointments.filter((a) => a.status === 'cancelado').length,
      monthRevenue,
      monthExpenses,
      pendingPayments,
    };
  }, [patients, appointments, transactions]);

  return {
    patients,
    appointments,
    records,
    transactions,
    packages,
    documents,
    stats,
    loading,
    firebaseConnected,
    addPatient,
    updatePatient,
    deletePatient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addRecord,
    updateRecord,
    deleteRecord,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addPackage,
    updatePackage,
    deletePackage,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}
