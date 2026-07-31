import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}

/**
 * Envia um e-mail via SMTP configurado. Se nenhuma credencial SMTP estiver
 * definida (ambiente de desenvolvimento), apenas registra o conteúdo no
 * console para permitir testar o fluxo sem um provedor real.
 */
export async function sendMail({ to, subject, html, attachments }: SendMailInput) {
  const client = getTransporter();

  if (!client) {
    console.log('--- [dev] E-mail não enviado (SMTP não configurado) ---');
    console.log('Para:', to);
    console.log('Assunto:', subject);
    console.log('Conteúdo:', html);
    console.log('----------------------------------------------------');
    return;
  }

  await client.sendMail({
    from: process.env.SMTP_FROM || 'OrcaFacil <naoresponda@orcafacil.com>',
    to,
    subject,
    html,
    attachments,
  });
}
