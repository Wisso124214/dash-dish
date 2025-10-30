import { resendApiKey } from '../config/secret-config.js';
import { Resend } from 'resend';
const resend = new Resend(resendApiKey);

export default class Mailer {
  constructor() {
    this.resend = resend;
  }

  sendEmail(to, subject, html) {
    this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
  }

  sendRecoveryEmail(email, token) {
    this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Password Recovery',
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">here</a> to reset your password.</p>`,
    });
  }
}
