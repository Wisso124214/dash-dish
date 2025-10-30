import { Resend } from 'resend';
const resend = new Resend('re_DDdWomfi_GBwGXnQN59bCRsoXQcAZRsK1');

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
