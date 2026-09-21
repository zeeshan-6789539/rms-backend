import { Inject, Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { mailConfig } from '../../config/mail.config.js';
import type { IMailConfig } from '../../config/interfaces/i-mail-config.js';
import {
  buildCredentialRow,
  buildEmailTemplate,
} from '../../common/utils/email-template.util.js';

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
    const bodyHtml = `<p style="margin:0 0 20px;color:#475467;font-size:14px;line-height:22px;">Your RMS account has been created. Here are your login details:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaecf0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        ${buildCredentialRow('Email', to)}
        ${buildCredentialRow('Password', password)}
      </table>
      <p style="margin:0;color:#475467;font-size:14px;line-height:22px;">Please sign in and change your password as soon as possible.</p>`;

    await this.send(
      to,
      'Welcome to RMS — your account details',
      buildEmailTemplate({
        title: 'Welcome to RMS',
        greetingName: fullName,
        bodyHtml,
      }),
    );
  }

  async sendPasswordChangedEmail(
    to: string,
    fullName: string,
    password: string,
  ): Promise<void> {
    const bodyHtml = `<p style="margin:0 0 20px;color:#475467;font-size:14px;line-height:22px;">The password for your RMS account (<strong>${to}</strong>) was just changed. Your new password is:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaecf0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        ${buildCredentialRow('Password', password)}
      </table>
      <p style="margin:0;color:#b42318;font-size:14px;line-height:22px;">If you did not request this change, contact an administrator immediately.</p>`;

    await this.send(
      to,
      'Your RMS password has been changed',
      buildEmailTemplate({
        title: 'Password Changed',
        greetingName: fullName,
        bodyHtml,
      }),
    );
  }

  async sendMonthlyRentInvoiceEmail(
    to: string,
    tenantName: string,
    propertyName: string,
    amount: string,
    monthLabel: string,
    description: string,
    dueDate: string,
  ): Promise<void> {
    const formattedAmount = Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedDueDate = new Date(`${dueDate}T00:00:00Z`).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    const bodyHtml = `<p style="margin:0 0 20px;color:#475467;font-size:14px;line-height:22px;">Your rent invoice for <strong>${monthLabel}</strong> has been generated. Here are the details:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaecf0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        ${buildCredentialRow('Property', propertyName)}
        ${buildCredentialRow('Billing Period', monthLabel)}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eaecf0;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <tr>
          <td style="padding:10px 16px;background-color:#f9fafb;color:#667085;font-size:12px;font-weight:600;text-transform:uppercase;">Description</td>
          <td style="padding:10px 16px;background-color:#f9fafb;color:#667085;font-size:12px;font-weight:600;text-transform:uppercase;">Due Date</td>
          <td style="padding:10px 16px;background-color:#f9fafb;color:#667085;font-size:12px;font-weight:600;text-transform:uppercase;text-align:right;">Amount</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#101828;font-size:13px;">${description}</td>
          <td style="padding:10px 16px;color:#101828;font-size:13px;">${formattedDueDate}</td>
          <td style="padding:10px 16px;color:#101828;font-size:13px;font-weight:600;text-align:right;">PKR ${formattedAmount}</td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:10px;margin-bottom:20px;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 4px;color:#e0e7ff;font-size:12px;letter-spacing:0.4px;text-transform:uppercase;">Amount Due</p>
            <p style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">PKR ${formattedAmount}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0;color:#475467;font-size:14px;line-height:22px;">Please make sure your payment is settled by the due date to avoid late fees.</p>`;

    await this.send(
      to,
      `Rent Invoice — ${propertyName} — ${monthLabel}`,
      buildEmailTemplate({
        title: 'Monthly Rent Invoice',
        greetingName: tenantName,
        bodyHtml,
      }),
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
