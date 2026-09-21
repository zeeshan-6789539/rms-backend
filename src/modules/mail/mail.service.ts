import { Inject, Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { mailConfig } from '../../config/mail.config.js';
import type { IMailConfig } from '../../config/interfaces/i-mail-config.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(@Inject(mailConfig.KEY) private readonly config: IMailConfig) {
    this.transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: { user: this.config.user, pass: this.config.password },
    });
  }

  async sendWelcomeEmail(
    to: string,
    fullName: string,
    password: string,
  ): Promise<void> {
    await this.send(
      to,
      'Welcome to RMS — your account details',
      `<p>Hi ${fullName},</p>
       <p>Your RMS account has been created. Here are your login details:</p>
       <ul>
         <li><strong>Email:</strong> ${to}</li>
         <li><strong>Password:</strong> ${password}</li>
       </ul>
       <p>Please sign in and change your password as soon as possible.</p>`,
    );
  }

  async sendPasswordChangedEmail(
    to: string,
    fullName: string,
    password: string,
  ): Promise<void> {
    await this.send(
      to,
      'Your RMS password has been changed',
      `<p>Hi ${fullName},</p>
       <p>The password for your RMS account (<strong>${to}</strong>) was just changed. Your new password is:</p>
       <p><strong>${password}</strong></p>
       <p>If you did not request this change, contact an administrator immediately.</p>`,
    );
  }

  // A stalled mail server should never block the request that triggered the email
  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email "${subject}" to ${to}: ${(error as Error).message}`,
      );
    }
  }
}
