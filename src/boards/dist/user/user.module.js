"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_controller_1 = require("./user.controller");
const auth_service_1 = require("./../auth/auth.service");
const user_service_1 = require("./user.service");
const user_repository_1 = require("./user.repository");
const auth_repository_1 = require("../auth/auth.repository");
const user_schema_1 = require("../schemas/user.schema");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const refresh_token_schema_1 = require("./../schemas/refresh-token.schema");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_ACCESS_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_ACCESS_EXPIRATION_TIME'),
                    },
                    refreshSecret: configService.get('JWT_REFRESH_SECRET'),
                    refreshSignOptions: {
                        expiresIn: configService.get('JWT_REFRESH_EXPIRATION_TIME'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forRoot('mongodb://localhost:27017/myDatabase'),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: refresh_token_schema_1.RefreshToken.name, schema: refresh_token_schema_1.RefreshTokenSchema },
            ]),
        ],
        controllers: [user_controller_1.UserController],
        providers: [
            auth_service_1.AuthService,
            user_service_1.UserService,
            auth_repository_1.AuthMongoRepository,
            user_repository_1.UserMongoRepository,
        ],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map