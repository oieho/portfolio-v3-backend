/// <reference types="multer" />
import { EmailService } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmail(file: Express.Multer.File, files: Express.Multer.File[], sender: string, subject: string, emailAddress: string, content: string): Promise<any>;
}
