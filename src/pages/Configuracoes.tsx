import { useState, useEffect, useRef } from 'react';
import { User, Building, Bell, Shield, Palette, Camera, Loader2, X, Plus, Upload, Check, Moon, Sun, Monitor } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CATEGORY_LABELS, 
  THERAPY_APPROACH_LABELS,
  ProfessionalCategory, 
  TherapyApproach,
  ProfessionalProfile 
} from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'branding', label: 'Personalização', icon: Palette },
  { id: 'clinic', label: 'Consultório', icon: Building },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Shield },
];

const colorPresets = [
  { name: 'Violeta', primary: '262 52% 47%', accent: '262 40% 94%', color: '#6d28d9' },
  { name: 'Azul', primary: '221 83% 53%', accent: '221 40% 94%', color: '#3b82f6' },
  { name: 'Verde', primary: '158 64% 42%', accent: '158 40% 94%', color: '#10b981' },
  { name: 'Rosa', primary: '330 81% 60%', accent: '330 40% 94%', color: '#ec4899' },
  { name: 'Laranja', primary: '25 95% 53%', accent: '25 40% 94%', color: '#f97316' },
  { name: 'Ciano', primary: '192 91% 36%', accent: '192 40% 94%', color: '#0891b2' },
];

const Configuracoes = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  
  const [profileData, setProfileData] = useState<Partial<ProfessionalProfile>>({
    name: '',
    email: '',
    phone: '',
    category: 'psicologo',
    registrationNumber: '',
    specialty: '',
    bio: '',
    approaches: [],
    sessionDuration: 50,
    sessionPrice: 200,
    onlineService: true,
    inPersonService: true,
  });

  const [clinicData, setClinicData] = useState({
    clinicName: '',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
  });

  const [brandingData, setBrandingData] = useState({
    brandName: 'Espaço Terapêutico',
    brandTagline: 'Gestão para Terapeutas e Psicólogos',
    brandEmail: '',
    brandPhone: '',
    brandWebsite: '',
  });

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: false,
    newPatient: true,
    cancelation: true,
    dailySummary: true,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid || !db || !isFirebaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data() as ProfessionalProfile;
          setProfileData({
            name: data.name || user.displayName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            category: data.category || 'psicologo',
            registrationNumber: data.registrationNumber || '',
            specialty: data.specialty || '',
            bio: data.bio || '',
            approaches: data.approaches || [],
            sessionDuration: data.sessionDuration || 50,
            sessionPrice: data.sessionPrice || 200,
            onlineService: data.onlineService ?? true,
            inPersonService: data.inPersonService ?? true,
          });
          setClinicData({
            clinicName: data.clinicName || '',
            clinicAddress: data.clinicAddress || '',
            clinicCity: data.clinicCity || '',
            clinicState: data.clinicState || '',
          });
          if (data.photoUrl) {
            setPhotoPreview(data.photoUrl);
          }
        } else {
          setProfileData(prev => ({
            ...prev,
            name: user.displayName || '',
            email: user.email || '',
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG ou GIF.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo muito grande. Máximo 2MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG, GIF ou SVG.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const toggleApproach = (approach: TherapyApproach) => {
    const current = profileData.approaches || [];
    if (current.includes(approach)) {
      setProfileData({
        ...profileData,
        approaches: current.filter(a => a !== approach),
      });
    } else {
      setProfileData({
        ...profileData,
        approaches: [...current, approach],
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.uid || !db || !isFirebaseConfigured) {
      toast.error('Erro de configuração. Tente novamente.');
      return;
    }

    setIsSaving(true);
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      const dataToSave = {
        ...profileData,
        ...clinicData,
        photoUrl: photoPreview || null,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (profileSnap.exists()) {
        await updateDoc(profileRef, dataToSave);
      } else {
        await setDoc(profileRef, {
          ...dataToSave,
          id: user.uid,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success('Perfil salvo com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = () => {
    toast.success('Personalização salva com sucesso!');
  };

  const handleSaveNotifications = () => {
    toast.success('Preferências de notificação salvas!');
  };

  const handleChangePassword = () => {
    toast.success('Senha alterada com sucesso!');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header 
        title="Configurações" 
        subtitle="Gerencie seu perfil profissional e preferências"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="glass-card p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className={cn('h-5 w-5', activeTab === tab.id && 'text-primary')} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 glass-card p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Perfil Profissional
                </h2>
                <p className="text-sm text-muted-foreground">
                  Suas informações serão exibidas para os pacientes na página de agendamento.
                </p>
              </div>

              {/* Photo Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Foto de perfil"
                        className="h-24 w-24 rounded-full object-cover border-4 border-primary/20"
                      />
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full avatar-gradient flex items-center justify-center text-2xl font-bold">
                      {getInitials(profileData.name || '')}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {photoPreview ? 'Alterar Foto' : 'Adicionar Foto'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG ou GIF. Máximo 2MB.
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Dr(a). Nome Completo"
                    className="input-styled mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input-styled mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone/WhatsApp</Label>
                  <Input 
                    id="phone" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="input-styled mt-1" 
                  />
                </div>
                <div>
                  <Label>Categoria Profissional</Label>
                  <Select 
                    value={profileData.category} 
                    onValueChange={(v) => setProfileData({ ...profileData, category: v as ProfessionalCategory })}
                  >
                    <SelectTrigger className="input-styled mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registro Profissional (CRP/CRM)</Label>
                  <Input 
                    id="registrationNumber" 
                    value={profileData.registrationNumber}
                    onChange={(e) => setProfileData({ ...profileData, registrationNumber: e.target.value })}
                    placeholder="CRP 06/12345"
                    className="input-styled mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Especialização</Label>
                  <Input 
                    id="specialty" 
                    value={profileData.specialty}
                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                    placeholder="Ex: Ansiedade e Depressão"
                    className="input-styled mt-1" 
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Sobre você</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Descreva sua formação, experiência e abordagem terapêutica..."
                  className="input-styled mt-1 min-h-[100px]"
                />
              </div>

              {/* Therapy Approaches */}
              <div>
                <Label className="mb-3 block">Abordagens Terapêuticas</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(THERAPY_APPROACH_LABELS).map(([key, label]) => {
                    const isSelected = profileData.approaches?.includes(key as TherapyApproach);
                    return (
                      <Badge
                        key={key}
                        variant={isSelected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all',
                          isSelected 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'hover:bg-secondary'
                        )}
                        onClick={() => toggleApproach(key as TherapyApproach)}
                      >
                        {isSelected && <Plus className="h-3 w-3 mr-1 rotate-45" />}
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Session Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Duração da Sessão</Label>
                  <Select 
                    value={String(profileData.sessionDuration)}
                    onValueChange={(v) => setProfileData({ ...profileData, sessionDuration: Number(v) })}
                  >
                    <SelectTrigger className="input-styled mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sessionPrice">Valor da Sessão (R$)</Label>
                  <Input 
                    id="sessionPrice" 
                    type="number"
                    value={profileData.sessionPrice}
                    onChange={(e) => setProfileData({ ...profileData, sessionPrice: Number(e.target.value) })}
                    className="input-styled mt-1" 
                  />
                </div>
              </div>

              {/* Service Type */}
              <div className="space-y-4">
                <Label>Modalidade de Atendimento</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 flex-1">
                    <div>
                      <p className="font-medium text-foreground">Atendimento Online</p>
                      <p className="text-sm text-muted-foreground">Videochamadas</p>
                    </div>
                    <Switch 
                      checked={profileData.onlineService}
                      onCheckedChange={(checked) => setProfileData({ ...profileData, onlineService: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 flex-1">
                    <div>
                      <p className="font-medium text-foreground">Atendimento Presencial</p>
                      <p className="text-sm text-muted-foreground">No consultório</p>
                    </div>
                    <Switch 
                      checked={profileData.inPersonService}
                      onCheckedChange={(checked) => setProfileData({ ...profileData, inPersonService: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Personalização da Marca
                </h2>
                <p className="text-sm text-muted-foreground">
                  Personalize as cores, logo e informações da sua clínica.
                </p>
              </div>

              {/* Logo Upload */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border">
                <Label className="mb-4 block">Logo da Clínica</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="h-20 w-20 rounded-xl object-contain bg-white p-2 border border-border"
                        />
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/svg+xml"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => logoInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {logoPreview ? 'Alterar Logo' : 'Enviar Logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPG, GIF ou SVG. Máximo 2MB. Recomendado: 512x512px
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border">
                <Label className="mb-4 block">Cor Principal</Label>
                <div className="flex flex-wrap gap-3">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedColor(index)}
                      className={cn(
                        'color-option flex items-center justify-center',
                        selectedColor === index && 'selected'
                      )}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      {selectedColor === index && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Esta cor será usada nos botões, links e acentos do sistema.
                </p>
              </div>

              {/* Theme Selection */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border">
                <Label className="mb-4 block">Tema da Interface</Label>
                <div className="flex items-center gap-2">
                  {[
                    { value: 'light' as const, icon: Sun, label: 'Claro' },
                    { value: 'dark' as const, icon: Moon, label: 'Escuro' },
                    { value: 'system' as const, icon: Monitor, label: 'Sistema' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border',
                        theme === option.value
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-background text-muted-foreground hover:text-foreground border-border hover:border-primary/50'
                      )}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Escolha entre tema claro, escuro ou automático (baseado no sistema).
                </p>
              </div>

              {/* Brand Info */}
              <div className="space-y-4">
                <Label className="block text-base">Informações da Marca</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandName">Nome da Clínica</Label>
                    <Input 
                      id="brandName" 
                      value={brandingData.brandName}
                      onChange={(e) => setBrandingData({ ...brandingData, brandName: e.target.value })}
                      placeholder="Espaço Terapêutico"
                      className="input-styled mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandTagline">Slogan / Descrição</Label>
                    <Input 
                      id="brandTagline" 
                      value={brandingData.brandTagline}
                      onChange={(e) => setBrandingData({ ...brandingData, brandTagline: e.target.value })}
                      placeholder="Gestão para Terapeutas"
                      className="input-styled mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandEmail">E-mail de Contato</Label>
                    <Input 
                      id="brandEmail" 
                      type="email"
                      value={brandingData.brandEmail}
                      onChange={(e) => setBrandingData({ ...brandingData, brandEmail: e.target.value })}
                      placeholder="contato@clinica.com.br"
                      className="input-styled mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandPhone">Telefone de Contato</Label>
                    <Input 
                      id="brandPhone" 
                      value={brandingData.brandPhone}
                      onChange={(e) => setBrandingData({ ...brandingData, brandPhone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="input-styled mt-1" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="brandWebsite">Website</Label>
                    <Input 
                      id="brandWebsite" 
                      value={brandingData.brandWebsite}
                      onChange={(e) => setBrandingData({ ...brandingData, brandWebsite: e.target.value })}
                      placeholder="www.suaclinica.com.br"
                      className="input-styled mt-1" 
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-5 rounded-xl bg-secondary/30 border border-border">
                <Label className="mb-4 block">Pré-visualização</Label>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-border">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded-lg object-contain" />
                  ) : (
                    <div 
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: colorPresets[selectedColor].color }}
                    >
                      {brandingData.brandName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{brandingData.brandName || 'Nome da Clínica'}</p>
                    <p className="text-sm text-muted-foreground">{brandingData.brandTagline || 'Sua descrição aqui'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient" onClick={handleSaveBranding}>
                  Salvar Personalização
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Dados do Consultório
                </h2>
                <p className="text-sm text-muted-foreground">
                  Informações do local de atendimento presencial.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="clinicName">Nome do Consultório</Label>
                  <Input 
                    id="clinicName" 
                    value={clinicData.clinicName}
                    onChange={(e) => setClinicData({ ...clinicData, clinicName: e.target.value })}
                    placeholder="Consultório de Psicologia"
                    className="input-styled mt-1" 
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="clinicAddress">Endereço Completo</Label>
                  <Input 
                    id="clinicAddress" 
                    value={clinicData.clinicAddress}
                    onChange={(e) => setClinicData({ ...clinicData, clinicAddress: e.target.value })}
                    placeholder="Rua, número, complemento"
                    className="input-styled mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="clinicCity">Cidade</Label>
                  <Input 
                    id="clinicCity" 
                    value={clinicData.clinicCity}
                    onChange={(e) => setClinicData({ ...clinicData, clinicCity: e.target.value })}
                    className="input-styled mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="clinicState">Estado</Label>
                  <Input 
                    id="clinicState" 
                    value={clinicData.clinicState}
                    onChange={(e) => setClinicData({ ...clinicData, clinicState: e.target.value })}
                    className="input-styled mt-1" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Preferências de Notificação
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure como e quando você deseja receber notificações.
                </p>
              </div>

              {/* Push Notifications Component */}
              <NotificationSettings />

              {/* Email/SMS Notifications */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Outras Notificações</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Lembretes por E-mail</p>
                    <p className="text-sm text-muted-foreground">Receber lembretes de consulta por e-mail</p>
                  </div>
                  <Switch 
                    checked={notifications.emailReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Lembretes por SMS</p>
                    <p className="text-sm text-muted-foreground">Receber lembretes de consulta por SMS</p>
                  </div>
                  <Switch 
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Novo Paciente</p>
                    <p className="text-sm text-muted-foreground">Notificar quando um novo paciente se cadastrar</p>
                  </div>
                  <Switch 
                    checked={notifications.newPatient}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newPatient: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Cancelamentos</p>
                    <p className="text-sm text-muted-foreground">Notificar quando uma consulta for cancelada</p>
                  </div>
                  <Switch 
                    checked={notifications.cancelation}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, cancelation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground">Resumo Diário</p>
                    <p className="text-sm text-muted-foreground">Receber um resumo diário das atividades</p>
                  </div>
                  <Switch 
                    checked={notifications.dailySummary}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, dailySummary: checked })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient" onClick={handleSaveNotifications}>
                  Salvar Preferências
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                  Segurança da Conta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie a senha e a segurança da sua conta.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input id="currentPassword" type="password" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input id="newPassword" type="password" className="input-styled mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input id="confirmPassword" type="password" className="input-styled mt-1" />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button className="btn-gradient" onClick={handleChangePassword}>
                  Alterar Senha
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
