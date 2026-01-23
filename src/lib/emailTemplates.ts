import { BRAND, getEmailTemplate } from '@/components/branding/Branding';

interface EmailTemplateProps {
  recipientName: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
}

export function generateWelcomeEmail(recipientName: string): string {
  const template = getEmailTemplate('welcome');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao ${BRAND.name}</title>
</head>
<body style="${template.baseStyles}">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="${template.headerStyles}">
      ${template.logoHtml}
    </div>
    <div style="${template.bodyStyles}">
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">
        Olá, ${recipientName}! 👋
      </h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px;">
        Seja muito bem-vindo(a) ao <strong>${BRAND.name}</strong>!
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px;">
        Seu cadastro foi realizado com sucesso. Agora você pode agendar suas 
        consultas de forma prática e rápida.
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
        Estamos aqui para cuidar do seu bem-estar e oferecer o melhor 
        atendimento possível.
      </p>
      <div style="text-align: center;">
        <a href="#" style="${template.buttonStyles}">
          Agendar Primeira Consulta
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin: 25px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        Em caso de dúvidas, entre em contato conosco. Estamos à disposição!
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

export function generateAppointmentConfirmationEmail(
  recipientName: string,
  appointmentDate: string,
  appointmentTime: string,
  therapistName: string
): string {
  const template = getEmailTemplate('appointment');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consulta Confirmada - ${BRAND.name}</title>
</head>
<body style="${template.baseStyles}">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="${template.headerStyles}">
      ${template.logoHtml}
    </div>
    <div style="${template.bodyStyles}">
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">
        Consulta Confirmada! ✅
      </h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px;">
        Olá, <strong>${recipientName}</strong>!
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
        Sua consulta foi agendada com sucesso. Confira os detalhes abaixo:
      </p>
      
      <div style="background: #f5f3ff; border-radius: 12px; padding: 25px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Data:</td>
            <td style="padding: 10px 0; color: #1f2937; font-weight: 600; text-align: right;">${appointmentDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Horário:</td>
            <td style="padding: 10px 0; color: #1f2937; font-weight: 600; text-align: right;">${appointmentTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Profissional:</td>
            <td style="padding: 10px 0; color: #1f2937; font-weight: 600; text-align: right;">${therapistName}</td>
          </tr>
        </table>
      </div>

      <p style="color: #4b5563; line-height: 1.6; margin: 20px 0 0;">
        <strong>Lembrete:</strong> Caso precise reagendar ou cancelar, 
        entre em contato com pelo menos 24 horas de antecedência.
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

export function generateReminderEmail(
  recipientName: string,
  appointmentDate: string,
  appointmentTime: string,
  meetingLink?: string
): string {
  const template = getEmailTemplate('reminder');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete de Consulta - ${BRAND.name}</title>
</head>
<body style="${template.baseStyles}">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="${template.headerStyles}">
      ${template.logoHtml}
    </div>
    <div style="${template.bodyStyles}">
      <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px;">
        Lembrete: Sua consulta é amanhã! 🔔
      </h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 15px;">
        Olá, <strong>${recipientName}</strong>!
      </p>
      <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
        Gostaríamos de lembrar que sua consulta está marcada para:
      </p>
      
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center;">
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 5px; font-size: 14px;">Data e Horário</p>
        <p style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
          ${appointmentDate} às ${appointmentTime}
        </p>
      </div>

      ${meetingLink ? `
      <div style="text-align: center;">
        <a href="${meetingLink}" style="${template.buttonStyles}">
          Entrar na Sala de Vídeo
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
        Clique no botão acima no horário da consulta
      </p>
      ` : ''}

      <p style="color: #4b5563; line-height: 1.6; margin: 25px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        Estamos ansiosos para vê-lo(a)! Até breve.
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

export function generateSessionSummaryEmail(
  recipientName: string,
  sessionDate: string,
  summary: string,
  nextSteps: string[]
): string {
  const template = getEmailTemplate('session');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumo da Sessão - ${BRAND.name}</title>
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
        Aqui está um resumo da nossa sessão de <strong>${sessionDate}</strong>:
      </p>
      
      <div style="background: #f5f3ff; border-radius: 12px; padding: 25px; margin: 20px 0;">
        <h3 style="color: #7c3aed; margin: 0 0 15px; font-size: 16px;">
          📌 Pontos Principais
        </h3>
        <p style="color: #4b5563; line-height: 1.6; margin: 0;">
          ${summary}
        </p>
      </div>

      ${nextSteps.length > 0 ? `
      <div style="margin: 25px 0;">
        <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 16px;">
          🎯 Próximos Passos
        </h3>
        <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
          ${nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <p style="color: #4b5563; line-height: 1.6; margin: 25px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        Lembre-se: cada passo conta em sua jornada. Estou aqui para apoiá-lo(a)!
      </p>

      <div style="text-align: center; margin-top: 25px;">
        <a href="#" style="${template.buttonStyles}">
          Agendar Próxima Sessão
        </a>
      </div>
    </div>
    <div style="${template.footerStyles}">
      ${template.footerHtml}
    </div>
  </div>
</body>
</html>
  `;
}
