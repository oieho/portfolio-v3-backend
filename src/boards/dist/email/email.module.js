"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const email_controller_1 = require("./email.controller");
const email_service_1 = require("./email.service");
const user_service_1 = require("../user/user.service");
const user_repository_1 = require("./../user/user.repository");
const platform_express_1 = require("@nestjs/platform-express");
const user_schema_1 = require("./../schemas/user.schema");
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT, 10),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD,
                    },
                },
            }),
            mongoose_1.MongooseModule.forFeature([{ name: 'User', schema: user_schema_1.UserSchema }]),
            platform_express_1.MulterModule.register({
                dest: './uploads',
            }),
        ],
        providers: [user_service_1.UserService, user_repository_1.UserMongoRepository, email_service_1.EmailService],
        exports: [mailer_1.MailerModule],
        controllers: [email_controller_1.EmailController],
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map