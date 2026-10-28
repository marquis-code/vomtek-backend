import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface MailMessage {
  to: string
  subject: string
  text: string
  replyTo?: string
  meta?: Record<string, unknown>
}

/**
 * Transport-agnostic mail boundary. In development everything is logged; in
 * production swap `send` for an SMTP/API transport without touching callers.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(private readonly config: ConfigService) {}

  async send(message: MailMessage): Promise<void> {
    const transport = this.config.get<string>('MAIL_TRANSPORT') || 'console'
    if (transport === 'console') {
      this.logger.log(`[mail:${message.to}] ${message.subject}${message.meta ? ` ${JSON.stringify(message.meta)}` : ''}`)
      return
    }
    // Production transport hook (SMTP / Resend / SES) goes here.
    this.logger.warn(`Mail transport "${transport}" is not implemented; message dropped.`)
  }

  async notifyTeam(subject: string, text: string, meta?: Record<string, unknown>, recipients?: string[]): Promise<void> {
    const fallback = this.config.get<string>('SALES_NOTIFY_EMAIL') || 'support@vomtek.com'
    const list = recipients?.length ? recipients : [fallback]
    for (const to of list) {
      await this.send({ to, subject, text, meta })
    }
  }
}
