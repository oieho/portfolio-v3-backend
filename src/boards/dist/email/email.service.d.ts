/// <reference types="multer" />
import { MailerService } from '@nestjs-modules/mailer';
export declare class EmailService {
    private readonly mailerService;
    constructor(mailerService: MailerService);
    sendEmail(sender: string, subject: string, emailAddress: string, content: string, file: Express.Multer.File | undefined, files: Express.Multer.File[]): Promise<any>;
}
