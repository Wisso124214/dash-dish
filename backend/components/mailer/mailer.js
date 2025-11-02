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

  sendRecoveryEmail(email, token, origin) {
    this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Dish Dash - Password Recovery',
      html: `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @media only screen and (max-width: 600px) {
            .container {
              padding: 8px !important;
            }
            .content {
              padding: 16px 8px 8px 8px !important;
            }
            .logo-text {
              font-size: 18px !important;
            }
            .title {
              font-size: 22px !important;
              padding-left: 8px !important;
            }
            .text {
              padding-left: 8px !important;
              font-size: 14px !important;
            }
            .button {
              padding: 10px 16px !important;
              font-size: 14px !important;
            }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:linear-gradient(#000 12%, #d5311d 70%);font-family:Arial,Helvetica,sans-serif !important;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(#000 12%, #d5311d 70%);min-width:350px;">
          <tr>
            <td align="center">
              <table class="container" width="100%" style="max-width:600px;margin:0 auto;padding:0 24px;">
                <tr>
                  <td style="padding:16px 0;background:black;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="display:flex;align-items:center;justify-content:center;">
                      <tr>
                        <td style="text-align:center;">
                          <img src='https://raw.githubusercontent.com/Wisso124214/dash-dish/refs/heads/main/frontend/src/assets/logo-mini.png' alt='Dash Dish Logo' style="margin-right:16px;height:48px;width:48px;vertical-align:middle;display:inline-block;" />
                          <span class="logo-text" style="color:white;font-size:24px;font-weight:bold;vertical-align:middle;display:inline-block;font-family:Arial,Helvetica,sans-serif !important;">Dash Dish</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="content" style="padding:40px 24px 24px 24px;color:white;font-family:Arial,Helvetica,sans-serif !important;">
                    <div class="title" style="margin-top:0px;font-size:32px;color:#e69524;font-weight:bold;font-family:Arial,Helvetica,sans-serif !important;padding-left:20px;">¿Olvidaste tu contraseña?</div>
                    <div class="text" style="margin-top:30px;font-family:Arial,Helvetica,sans-serif !important;padding-left:20px;">Recibimos tu solicitud de restablecimiento de contraseña.</div>
                    <div class="text" style="margin-top:10px;font-family:Arial,Helvetica,sans-serif !important;padding-left:20px;">¡Vamos a conseguirte una nueva!</div>
                    <div style="margin-top:30px;font-family:Arial,Helvetica,sans-serif !important;padding-left:20px;">
                      <a class="button" href="${origin}/reset-password?token=${token}" style="display:inline-block;padding:12px 24px;background-color:#3d1b39;color:white;font-weight:bold;border-radius:15px;text-decoration:none;font-family:Arial,Helvetica,sans-serif !important;">Reestablecer contraseña</a>
                    </div>
                    <div class="text" style="margin-top:35px;font-family:Arial,Helvetica,sans-serif !important;padding-left:20px;">
                      ¿Tienes problemas o preguntas? Contáctanos en
                      <a href="mailto:support@dashdish.com" style="color:#3d1b39;font-weight:bold;text-decoration:underline;font-family:Arial,Helvetica,sans-serif !important;">support@dashdish.com</a>
                    </div>
                    <div class="text" style="margin-top:20px;font-family:Arial,Helvetica,sans-serif !important;padding-left:20px;">¿No solicitaste un restablecimiento de contraseña? Por favor, ignora este correo electrónico.</div>
                    <div class="text" style="margin-top:60px;font-family:Arial,Helvetica,sans-serif !important;padding-left:20px;">Gracias por preferirnos,<br />El equipo de Dash Dish</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    });
  }
}
