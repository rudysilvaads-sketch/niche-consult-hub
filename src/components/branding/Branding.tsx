import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandingProps {
  variant?: 'icon' | 'text' | 'full';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: {
    icon: 'h-9 w-9',
    iconInner: 'h-4 w-4',
    text: 'text-sm',
    subtext: 'text-[10px]',
  },
  md: {
    icon: 'h-10 w-10',
    iconInner: 'h-5 w-5',
    text: 'text-base',
    subtext: 'text-xs',
  },
  lg: {
    icon: 'h-14 w-14',
    iconInner: 'h-7 w-7',
    text: 'text-xl',
    subtext: 'text-sm',
  },
  xl: {
    icon: 'h-20 w-20',
    iconInner: 'h-10 w-10',
    text: 'text-2xl',
    subtext: 'text-base',
  },
};

export function Branding({ variant = 'full', size = 'md', className = '' }: BrandingProps) {
  const sizes = sizeClasses[size];

  if (variant === 'icon') {
    return (
      <div className={cn('rounded-xl bg-accent flex items-center justify-center', sizes.icon, className)}>
        <Sparkles className={cn('text-primary', sizes.iconInner)} />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('flex flex-col', className)}>
        <span className={cn('font-display font-bold text-foreground', sizes.text)}>
          Espaço Terapêutico
        </span>
        <span className={cn('text-muted-foreground', sizes.subtext)}>
          Gestão para Terapeutas e Psicólogos
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('rounded-xl bg-accent flex items-center justify-center', sizes.icon)}>
        <Sparkles className={cn('text-primary', sizes.iconInner)} />
      </div>
      <div>
        <p className={cn('font-semibold text-foreground leading-tight', sizes.text)}>Espaço</p>
        <p className={cn('text-muted-foreground leading-tight', sizes.subtext)}>Terapêutico</p>
      </div>
    </div>
  );
}

// Brand constants for use across the app
export const BRAND = {
  name: 'Espaço Terapêutico',
  tagline: 'Gestão para Terapeutas e Psicólogos',
  email: 'contato@espacoterapeutico.com.br',
  website: 'www.espacoterapeutico.com.br',
  primaryColor: '#6d28d9',
  accentColor: '#a78bfa',
};

// Email template helper
export function getEmailTemplate(type: 'welcome' | 'appointment' | 'reminder' | 'session') {
  const baseStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #fafafa;
    padding: 40px 20px;
  `;

  const headerStyles = `
    background: linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%);
    padding: 30px;
    text-align: center;
    border-radius: 16px 16px 0 0;
  `;

  const bodyStyles = `
    background-color: #ffffff;
    padding: 40px 30px;
    border-radius: 0 0 16px 16px;
    border: 1px solid #e5e5e5;
    border-top: none;
    color: #1a1a1a;
  `;

  const buttonStyles = `
    display: inline-block;
    background: linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%);
    color: #ffffff;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    margin: 20px 0;
  `;

  const footerStyles = `
    text-align: center;
    padding: 20px;
    color: #666666;
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
          <span style="color: white; font-size: 24px;">✨</span>
        </div>
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
        Espaço Terapêutico
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px;">
        Gestão para Terapeutas e Psicólogos
      </p>
    `,
    footerHtml: `
      <p style="margin: 0 0 10px; color: #666666;">
        ${BRAND.name}<br>
        <a href="mailto:${BRAND.email}" style="color: #6d28d9;">${BRAND.email}</a>
      </p>
      <p style="margin: 0; color: #999999; font-size: 11px;">
        Este é um email automático. Por favor, não responda.
      </p>
    `,
  };
}
