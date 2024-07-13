"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const common_2 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const user_service_1 = require("./../user/user.service");
const auth_controller_1 = require("./auth.controller");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_repository_1 = require("./auth.repository");
const user_repository_1 = require("./../user/user.repository");
const refresh_token_schema_1 = require("./../schemas/refresh-token.schema");
const user_schema_1 = require("./../schemas/user.schema");
const user_module_1 = require("./../user/user.module");
const redis_module_1 = require("../redis/redis.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            redis_module_1.RedisModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            passport_1.PassportModule.register({}),
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
            (0, common_2.forwardRef)(() => user_module_1.UserModule),
            mongoose_1.MongooseModule.forFeature([
                { name: 'RefreshToken', schema: refresh_token_schema_1.RefreshTokenSchema },
                { name: 'User', schema: user_schema_1.UserSchema },
            ]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            config_1.ConfigService,
            auth_service_1.AuthService,
            user_service_1.UserService,
            jwt_auth_guard_1.JwtAuthGuard,
            auth_repository_1.AuthMongoRepository,
            user_repository_1.UserMongoRepository,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map