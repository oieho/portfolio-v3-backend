import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Express } from 'express';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    sender: string,
    subject: string,
    emailAddress: string,
    content: string,
    file: Express.Multer.File | undefined,
    files: Express.Multer.File[],
  ): Promise<any> {
    let attachments = [];

    // file이 존재하면 배열에 추가
    if (file) {
      attachments.push({
        filename: file.originalname,
        content: file.buffer,
      });
    }

    // files가 존재하면 배열에 추가
    if (files && files.length > 0) {
      attachments = [
        ...attachments,
        ...files.map((f) => ({
          filename: f.originalname,
          content: f.buffer,
        })),
      ];
    }

    const mailOptions = {
      to: 'oiehomail@gmail.com',
      subject:subject + '   -   보낸사람 : ' + sender + '(' + emailAddress + ')',
      text: content,
      attachments: attachments.length > 0 ? attachments : [],
    };

    try {
      const result = await this.mailerService.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
