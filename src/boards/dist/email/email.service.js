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
const user_service_1 = require("../user/user.service");
let EmailService = class EmailService {
    constructor(userService, mailerService) {
        this.userService = userService;
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
            await this.mailerService.sendMail(mailOptions);
            return;
        }
        catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
    async sendEmailToFindTheID(name, email) {
        const id = await this.userService.findUserId(name);
        const mailOptions = {
            to: email,
            subject: 'OIEHO 아이디 찾기 메일입니다.',
            html: `
      <p>아이디 찾기를 요청하셨습니다. 아이디는 다음과 같습니다.</p>
      <br>
      <span style='font-size:2rem;font-weight:bold;'>${id}</span>
    `,
        };
        try {
            await this.mailerService.sendMail(mailOptions);
            return;
        }
        catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        mailer_1.MailerService])
], EmailService);
//# sourceMappingURL=email.service.js.map