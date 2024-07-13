/// <reference types="multer" />
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '../user/user.service';
export declare class EmailService {
    private readonly userService;
    private readonly mailerService;
    constructor(userService: UserService, mailerService: MailerService);
    sendEmail(sender: string, subject: string, emailAddress: string, content: string, file: Express.Multer.File | undefined, files: Express.Multer.File[]): Promise<any>;
    sendEmailToFindTheID(name: string, email: string): Promise<any>;
}
