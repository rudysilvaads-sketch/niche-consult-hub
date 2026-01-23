import { useState, useMemo } from 'react';
import { format, addDays, isBefore, isToday, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Mail, Phone, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Validation schema
const bookingSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20, 'Telefone muito longo'),
  notes: z.string().max(500, 'Observações muito longas').optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Available time slots configuration
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

const CONSULTATION_TYPES = [
  { id: 'primeira', label: 'Primeira Sessão', duration: 60 },
  { id: 'retorno', label: 'Sessão de Acompanhamento', duration: 50 },
  { id: 'avaliacao', label: 'Avaliação Inicial', duration: 90 },
];

type Step = 'type' | 'date' | 'time' | 'form' | 'confirmation';

const Agendar = () => {
  const { appointments, addAppointment, addPatient, patients } = useApp();
  
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate next 14 days for selection
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const startDate = addDays(new Date(), weekOffset * 7);
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      // Skip past dates and Sundays
      if (!isBefore(startOfDay(date), startOfDay(new Date())) && date.getDay() !== 0) {
        dates.push(date);
      }
    }
    return dates;
  }, [weekOffset]);

  // Get available slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return TIME_SLOTS;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const bookedTimes = appointments
      .filter(a => a.date === dateStr && a.status !== 'cancelado')
      .map(a => a.time);
    
    const now = new Date();
    const isSelectedToday = isToday(selectedDate);
    
    return TIME_SLOTS.filter(slot => {
      // Check if slot is already booked
      if (bookedTimes.includes(slot)) return false;
      
      // If today, check if time has passed
      if (isSelectedToday) {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hours, minutes, 0, 0);
        if (slotTime <= now) return false;
      }
      
      return true;
    });
  }, [selectedDate, appointments]);

  const handleNext = () => {
    const steps: Step[] = ['type', 'date', 'time', 'form', 'confirmation'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['type', 'date', 'time', 'form', 'confirmation'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const validateForm = (): boolean => {
    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedDate || !selectedTime || !selectedType) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if patient already exists by email
      let patient = patients.find(p => p.email.toLowerCase() === formData.email.toLowerCase());
      
      if (!patient) {
        // Create new patient
        patient = await addPatient({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          birthDate: '',
          cpf: '',
          status: 'ativo',
          notes: 'Cadastrado via agendamento online',
        });
      }
      
      const consultationType = CONSULTATION_TYPES.find(t => t.id === selectedType);
      
      // Create appointment
      await addAppointment({
        patientId: patient?.id || '',
        patientName: formData.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        duration: consultationType?.duration || 60,
        status: 'agendado',
        type: consultationType?.label || 'Consulta',
        notes: formData.notes || 'Agendado online pelo paciente',
      });
      
      setBookingComplete(true);
      setStep('confirmation');
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrors({ submit: 'Erro ao criar agendamento. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep('type');
    setSelectedType(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setErrors({});
    setBookingComplete(false);
    setWeekOffset(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Espaço Terapêutico Online</h1>
              <p className="text-sm text-muted-foreground">Agende sua sessão terapêutica</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              Agendamento Online
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        {!bookingComplete && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {(['type', 'date', 'time', 'form'] as Step[]).map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    step === s 
                      ? 'bg-primary text-primary-foreground' 
                      : (['type', 'date', 'time', 'form'] as Step[]).indexOf(step) > index
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={cn(
                    'w-12 h-0.5 mx-1',
                    (['type', 'date', 'time', 'form'] as Step[]).indexOf(step) > index
                      ? 'bg-primary/40'
                      : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step: Select Type */}
        {step === 'type' && (
          <Card className="card-elevated">
            <CardHeader className="text-center">
              <CardTitle>Tipo de Consulta</CardTitle>
              <CardDescription>Selecione o tipo de atendimento desejado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {CONSULTATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      handleNext();
                    }}
                    className={cn(
                      'p-6 rounded-xl border-2 text-left transition-all hover:shadow-md',
                      selectedType === type.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <h3 className="font-semibold text-foreground">{type.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Duração: {type.duration} minutos
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Select Date */}
        {step === 'date' && (
          <Card className="card-elevated">
            <CardHeader className="text-center">
              <CardTitle>Escolha a Data</CardTitle>
              <CardDescription>Selecione o dia para sua consulta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                  disabled={weekOffset === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  {format(addDays(new Date(), weekOffset * 7), "MMMM 'de' yyyy", { locale: ptBR })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  disabled={weekOffset >= 3}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      handleNext();
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center transition-all hover:shadow-md',
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <p className="text-xs text-muted-foreground uppercase">
                      {format(date, 'EEE', { locale: ptBR })}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {format(date, 'd')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(date, 'MMM', { locale: ptBR })}
                    </p>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-start mt-6">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Select Time */}
        {step === 'time' && (
          <Card className="card-elevated">
            <CardHeader className="text-center">
              <CardTitle>Escolha o Horário</CardTitle>
              <CardDescription>
                {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        handleNext();
                      }}
                      className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all hover:shadow-md',
                        selectedTime === time
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-semibold text-foreground">{time}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Não há horários disponíveis nesta data.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={handleBack}>
                    Escolher outra data
                  </Button>
                </div>
              )}
              
              {availableSlots.length > 0 && (
                <div className="flex justify-start mt-6">
                  <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step: Contact Form */}
        {step === 'form' && (
          <Card className="card-elevated">
            <CardHeader className="text-center">
              <CardTitle>Seus Dados</CardTitle>
              <CardDescription>
                Preencha suas informações para confirmar o agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Booking Summary */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">Resumo do agendamento:</p>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedTime}
                  </Badge>
                  <Badge variant="secondary">
                    {CONSULTATION_TYPES.find(t => t.id === selectedType)?.label}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                    className={cn('mt-1', errors.name && 'border-destructive')}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className={cn('mt-1', errors.email && 'border-destructive')}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className={cn('mt-1', errors.phone && 'border-destructive')}
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Alguma informação adicional que deseja compartilhar..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                {errors.submit && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {errors.submit}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-gradient">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Confirmation */}
        {step === 'confirmation' && bookingComplete && (
          <Card className="card-elevated text-center">
            <CardContent className="pt-10 pb-10">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Agendamento Confirmado!
              </h2>
              <p className="text-muted-foreground mb-6">
                Seu horário foi reservado com sucesso.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-foreground">
                      {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{formData.name}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Você receberá uma confirmação por email em breve.
              </p>
              
              <Button onClick={resetBooking} variant="outline">
                Fazer novo agendamento
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sistema de agendamento online
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Agendar;
