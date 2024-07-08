"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let EmailService = class EmailService {
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    async sendEmail(sender, subject, emailAddress, content, file, files) {
        let attachments = [];
        if (file) {
            attachments.push({
                filename: file.originalname,
                content: file.buffer,
            });
        }
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
            subject: subject + '   -   보낸사람 : ' + sender + '(' + emailAddress + ')',
            text: content,
            attachments: attachments.length > 0 ? attachments : [],
        };
        try {
            const result = await this.mailerService.sendMail(mailOptions);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], EmailService);
//# sourceMappingURL=email.service.js.map