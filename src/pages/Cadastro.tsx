import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useValidateRegistrationLink } from '@/hooks/useRegistrationLinks';
import { useApp } from '@/contexts/AppContext';
import { RegistrationLink } from '@/types/telehealth';
import { Branding } from '@/components/branding/Branding';

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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validando link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isInvalid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Inválido</h2>
            <p className="text-muted-foreground text-center mb-6">
              Este link de cadastro expirou ou não é mais válido.
              <br />
              Entre em contato com seu terapeuta para obter um novo link.
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle className="h-16 w-16 text-success mb-4" />
            <h2 className="text-xl font-semibold mb-2">Cadastro Realizado!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Seu cadastro foi realizado com sucesso.
              <br />
              Você receberá um e-mail com instruções para agendar sua primeira consulta.
            </p>
            <Button onClick={() => navigate('/agendar')}>
              Agendar Consulta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Branding variant="full" size="md" className="justify-center mb-4" />
          <CardTitle className="text-2xl">Cadastro de Paciente</CardTitle>
          <CardDescription>
            Preencha seus dados para se cadastrar e poder agendar consultas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Cidade, Estado"
              />
            </div>

            <Button type="submit" className="w-full btn-gradient" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  Finalizar Cadastro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao se cadastrar, você concorda com nossa política de privacidade
              e termos de uso.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cadastro;
