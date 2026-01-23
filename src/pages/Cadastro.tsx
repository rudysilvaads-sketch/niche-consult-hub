import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, AlertCircle, Loader2, Sparkles, User, Mail, Phone, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useValidateRegistrationLink } from '@/hooks/useRegistrationLinks';
import { useApp } from '@/contexts/AppContext';
import { RegistrationLink } from '@/types/telehealth';

const Cadastro = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { validateLink, markLinkAsUsed } = useValidateRegistrationLink();
  const { addPatient } = useApp();

  const [linkData, setLinkData] = useState<RegistrationLink | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    cpf: '',
    address: '',
  });

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setIsInvalid(true);
        setIsValidating(false);
        return;
      }

      const link = await validateLink(token);
      if (link) {
        setLinkData(link);
      } else {
        setIsInvalid(true);
      }
      setIsValidating(false);
    };

    validate();
  }, [token, validateLink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      await addPatient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\D/g, ''),
        birthDate: formData.birthDate,
        cpf: formData.cpf.replace(/\D/g, ''),
        address: formData.address,
        status: 'ativo',
        notes: 'Cadastrado via link de registro',
      });

      if (linkData) {
        await markLinkAsUsed(linkData.id, linkData.usedCount);
      }

      setIsSuccess(true);
      toast.success('Cadastro realizado com sucesso!');
    } catch (error) {
      console.error('Error registering patient:', error);
      toast.error('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at top, hsl(262 83% 58% / 0.1), transparent 50%)'
          }}
        />
        <div className="glass-card p-12 text-center relative z-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validando link...</p>
        </div>
      </div>
    );
  }

  if (isInvalid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at top, hsl(262 83% 58% / 0.1), transparent 50%)'
          }}
        />
        <div className="glass-card p-12 text-center max-w-md relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Link Inválido</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Este link de cadastro expirou ou não é mais válido.
            Entre em contato com seu terapeuta para obter um novo link.
          </p>
          <Button 
            variant="outline" 
            className="bg-secondary/50 border-border/50 hover:bg-secondary"
            onClick={() => navigate('/')}
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at top, hsl(262 83% 58% / 0.1), transparent 50%)'
          }}
        />
        <div className="glass-card p-12 text-center max-w-md relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Cadastro Realizado!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Seu cadastro foi realizado com sucesso.
            Você receberá um e-mail com instruções para agendar sua primeira consulta.
          </p>
          <Button className="btn-gradient gap-2" onClick={() => navigate('/agendar')}>
            Agendar Consulta
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at top, hsl(262 83% 58% / 0.1), transparent 50%)'
        }}
      />
      
      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Cadastro de Paciente</h1>
          <p className="text-sm text-muted-foreground">
            Preencha seus dados para se cadastrar e agendar consultas
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">E-mail *</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formatPhone(formData.phone)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate" className="text-sm font-medium">Data de Nascimento</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                <div className="relative mt-1.5">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formatCPF(formData.cpf)}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="address" className="text-sm font-medium">Endereço</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Cidade, Estado"
                  className="pl-10 h-11 bg-secondary/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 btn-gradient gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  Finalizar Cadastro
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao se cadastrar, você concorda com nossa política de privacidade e termos de uso.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
