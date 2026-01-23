import { useState, useCallback } from 'react';
import { Patient, Appointment, ConsultationRecord, DashboardStats, Transaction, ServicePackage, Document } from '@/types';
import { mockPatients, mockAppointments, mockRecords, mockTransactions, mockPackages, mockDocuments } from '@/data/mockData';

export function useAppData() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [records, setRecords] = useState<ConsultationRecord[]>(mockRecords);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [packages, setPackages] = useState<ServicePackage[]>(mockPackages);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  // Patient CRUD
  const addPatient = useCallback((patient: Partial<Patient>) => {
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      birthDate: patient.birthDate || '',
      cpf: patient.cpf || '',
      address: patient.address,
      notes: patient.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPatients((prev) => [...prev, newPatient]);
    return newPatient;
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deletePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Appointment CRUD
  const addAppointment = useCallback((appointment: Partial<Appointment>) => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
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
    setAppointments((prev) => [...prev, newAppointment]);
    return newAppointment;
  }, []);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Record CRUD
  const addRecord = useCallback((record: Partial<ConsultationRecord>) => {
    const newRecord: ConsultationRecord = {
      id: Date.now().toString(),
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
    setRecords((prev) => [...prev, newRecord]);
    return newRecord;
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<ConsultationRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Transaction CRUD
  const addTransaction = useCallback((transaction: Partial<Transaction>) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
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
    setTransactions((prev) => [...prev, newTransaction]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Package CRUD
  const addPackage = useCallback((pkg: Partial<ServicePackage>) => {
    const newPackage: ServicePackage = {
      id: Date.now().toString(),
      name: pkg.name || '',
      description: pkg.description,
      sessions: pkg.sessions || 1,
      value: pkg.value || 0,
      validity: pkg.validity || 30,
      isActive: pkg.isActive ?? true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPackages((prev) => [...prev, newPackage]);
    return newPackage;
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<ServicePackage>) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Document CRUD
  const addDocument = useCallback((doc: Partial<Document>) => {
    const newDocument: Document = {
      id: Date.now().toString(),
      type: doc.type || 'recibo',
      patientId: doc.patientId || '',
      patientName: doc.patientName || '',
      appointmentId: doc.appointmentId,
      title: doc.title || '',
      content: doc.content || '',
      date: doc.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [...prev, newDocument]);
    return newDocument;
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Calculate financial stats
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

  // Calculate stats
  const stats: DashboardStats = {
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

  return {
    patients,
    appointments,
    records,
    transactions,
    packages,
    documents,
    stats,
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
