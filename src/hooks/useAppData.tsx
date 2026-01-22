import { useState, useCallback } from 'react';
import { Patient, Appointment, ConsultationRecord, DashboardStats } from '@/types';
import { mockPatients, mockAppointments, mockRecords } from '@/data/mockData';

export function useAppData() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [records, setRecords] = useState<ConsultationRecord[]>(mockRecords);

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
  };

  return {
    patients,
    appointments,
    records,
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
  };
}
