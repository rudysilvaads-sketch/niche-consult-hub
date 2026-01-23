import logoImage from '@/assets/logo.png';

interface BrandingProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: { logo: 'h-8', text: 'text-lg', icon: 'h-8 w-8' },
  md: { logo: 'h-12', text: 'text-xl', icon: 'h-12 w-12' },
  lg: { logo: 'h-16', text: 'text-2xl', icon: 'h-16 w-16' },
  xl: { logo: 'h-24', text: 'text-3xl', icon: 'h-24 w-24' },
};

export function Branding({ variant = 'full', size = 'md', className = '' }: BrandingProps) {
  const sizes = sizeClasses[size];

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent ${sizes.icon} ${className}`}>
        <span className="text-primary-foreground font-bold text-lg">ET</span>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`font-display font-bold text-foreground ${sizes.text}`}>
          Espaço Terapêutico
        </span>
        <span className="text-xs text-muted-foreground">
          Gestão para Terapeutas e Psicólogos
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={logoImage} alt="Espaço Terapêutico" className={sizes.logo} />
    </div>
  );
}

// Brand constants for use across the app
export const BRAND = {
  name: 'Espaço Terapêutico',
  tagline: 'Gestão para Terapeutas e Psicólogos',
  email: 'contato@espacoterapeutico.com.br',
  website: 'www.espacoterapeutico.com.br',
  primaryColor: '#5b21b6', // Deep Indigo Purple
  accentColor: '#a78bfa', // Soft Lilac
};

// Email template helper
export function getEmailTemplate(type: 'welcome' | 'appointment' | 'reminder' | 'session') {
  const baseStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1e1b4b;
    padding: 40px 20px;
  `;

  const headerStyles = `
    background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a78bfa 100%);
    padding: 30px;
    text-align: center;
    border-radius: 16px 16px 0 0;
  `;

  const bodyStyles = `
    background-color: #ffffff;
    padding: 40px 30px;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  `;

  const buttonStyles = `
    display: inline-block;
    background: linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%);
    color: #1e1b4b;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    margin: 20px 0;
  `;

  const footerStyles = `
    text-align: center;
    padding: 20px;
    color: rgba(255,255,255,0.6);
    font-size: 12px;
  `;

  return {
    baseStyles,
    headerStyles,
    bodyStyles,
    buttonStyles,
    footerStyles,
    logoHtml: `
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">ET</span>
        </div>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
        Espaço Terapêutico
      </h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px;">
        Gestão para Terapeutas e Psicólogos
      </p>
    `,
    footerHtml: `
      <p style="margin: 0 0 10px; color: rgba(255,255,255,0.7);">
        ${BRAND.name}<br>
        <a href="mailto:${BRAND.email}" style="color: #a78bfa;">${BRAND.email}</a>
      </p>
      <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px;">
        Este é um email automático. Por favor, não responda.
      </p>
    `,
  };
}
