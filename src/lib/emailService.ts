import emailjs from '@emailjs/browser';
import { BRAND, getEmailTemplate } from '@/components/branding/Branding';

// EmailJS configuration - User needs to set up their own account at https://www.emailjs.com/
// These values should be configured in the app settings or environment
const EMAILJS_CONFIG = {
  serviceId: 'service_psicolog', // User should replace with their EmailJS service ID
  templateId: 'template_summary', // User should replace with their EmailJS template ID
  publicKey: 'YOUR_PUBLIC_KEY', // User should replace with their EmailJS public key
};

interface SendSummaryEmailParams {
  recipientEmail: string;
  recipientName: string;
  patientSummary: string;
  sessionDate: string;
  therapistName: string;
  shareLink: string;
  topics: string[];
  emotionalState: string;
  followUpSuggestions: string[];
}

export async function sendSummaryEmail(params: SendSummaryEmailParams): Promise<boolean> {
  const {
    recipientEmail,
    recipientName,
    patientSummary,
    sessionDate,
    therapistName,
    shareLink,
    topics,
    emotionalState,
    followUpSuggestions,
  } = params;

  try {
    // Check if EmailJS is configured
    if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
      console.warn('EmailJS not configured. Using fallback method.');
      return openMailtoFallback(params);
    }

    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      from_name: therapistName,
      brand_name: BRAND.name,
      session_date: sessionDate,
      patient_summary: patientSummary,
      topics: topics.join(', '),
      emotional_state: emotionalState,
      follow_up_suggestions: followUpSuggestions.join('\n• '),
      share_link: shareLink,
      reply_to: BRAND.email,
    };

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    return true;
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    // Fallback to mailto
    return openMailtoFallback(params);
  }
}

function openMailtoFallback(params: SendSummaryEmailParams): boolean {
  const {
    recipientEmail,
    recipientName,
    patientSummary,
    sessionDate,
    therapistName,
    shareLink,
    topics,
    followUpSuggestions,
  } = params;

  const firstName = recipientName.split(' ')[0];
  
  const subject = encodeURIComponent(`Resumo da Sua Sessão - ${sessionDate}`);
  
  const body = encodeURIComponent(
`Olá ${firstName},

${patientSummary}

📌 Tópicos Abordados:
${topics.map(t => `• ${t}`).join('\n')}

🎯 Sugestões de Acompanhamento:
${followUpSuggestions.map(s => `• ${s}`).join('\n')}

🔗 Acesse o resumo completo:
${shareLink}

Atenciosamente,
${therapistName}
${BRAND.name}
`
  );

  const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  
  window.open(mailtoLink, '_blank');
  
  return true;
}

export function generateSummaryEmailHtml(params: SendSummaryEmailParams): string {
  const template = getEmailTemplate('session');
  const {
    recipientName,
    patientSummary,
    sessionDate,
    therapistName,
    shareLink,
    topics,
    emotionalState,
    followUpSuggestions,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumo da Sua Sessão - ${BRAND.name}</title>
</head>
<body style="${template.baseStyles}">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="${template.headerStyles}">
      ${template.logoHtml}
    </div>
    <div style="${template.bodyStyles}">
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">
        Resumo da Sua Sessão 📝
      </h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px;">
        Olá, <strong>${recipientName}</strong>!
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
        Aqui está o resumo da nossa sessão de <strong>${sessionDate}</strong>:
      </p>
      
      <div style="background: #f5f3ff; border-radius: 12px; padding: 25px; margin: 20px 0;">
        <p style="color: #4b5563; line-height: 1.6; margin: 0;">
          ${patientSummary}
        </p>
      </div>

      <div style="margin: 25px 0;">
        <h3 style="color: #7c3aed; margin: 0 0 15px; font-size: 16px;">
          📌 Tópicos Abordados
        </h3>
        <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
          ${topics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
      </div>

      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 5px; font-size: 14px;">Estado Emocional</p>
        <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
          ${emotionalState}
        </p>
      </div>

      ${followUpSuggestions.length > 0 ? `
      <div style="margin: 25px 0;">
        <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 16px;">
          🎯 Sugestões de Acompanhamento
        </h3>
        <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
          ${followUpSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 25px;">
        <a href="${shareLink}" style="${template.buttonStyles}">
          Ver Resumo Completo
        </a>
      </div>

      <p style="color: #4b5563; line-height: 1.6; margin: 25px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        Lembre-se: cada passo conta em sua jornada. Estou aqui para apoiá-lo(a)!
      </p>
      <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0;">
        Atenciosamente,<br>
        <strong>${therapistName}</strong>
      </p>
    </div>
    <div style="${template.footerStyles}">
      ${template.footerHtml}
    </div>
  </div>
</body>
</html>
  `;
}
