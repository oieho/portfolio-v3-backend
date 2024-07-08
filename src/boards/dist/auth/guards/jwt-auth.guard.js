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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(configService, jwtService, authService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const path = request.route.path;
        const oldAccessToken = this.extractAccessToken(request);
        const oldRefreshToken = request.cookies['refresh_token'];
        const accessExp = this.extractExpiration(oldAccessToken);
        const refreshExp = this.extractExpiration(oldRefreshToken);
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        if (path !== '/auth/authenticate') {
            if (accessExp > currentTimeInSeconds &&
                refreshExp <= currentTimeInSeconds) {
                try {
                    const verifiedAccessToken = this.jwtService.verify(oldAccessToken);
                    const userInfo = await this.authService.extractUserInfoFromPayload(verifiedAccessToken);
                    const newRefreshToken = await this.authService.generateRefreshToken(userInfo);
                    this.authService.setCurrentRefreshToken(verifiedAccessToken.userId, newRefreshToken);
                    response.cookie('refresh_token', newRefreshToken, {
                        httpOnly: true,
                    });
                    return false;
                }
                catch (error) {
                    console.error('Invalid Access token', error.message);
                }
            }
            else if (accessExp <= currentTimeInSeconds &&
                refreshExp > currentTimeInSeconds) {
                const verifiedRefreshToken = this.jwtService.verify(oldRefreshToken, {
                    secret: process.env.JWT_REFRESH_SECRET,
                });
                const userInfo = await this.authService.extractUserInfoFromPayload(verifiedRefreshToken);
                let refreshTokenInDB = await this.authService.getRefreshTokenByUserId(userInfo.userId);
                const matchedRefreshToken = await this.authService.getUserIfRefreshTokenMatches(oldRefreshToken, refreshTokenInDB.currentRefreshToken);
                if (matchedRefreshToken) {
                    const newAccessToken = await this.authService.generateAccessToken(userInfo);
                    response.setHeader('Authorization', 'Bearer ' + newAccessToken);
                    response.cookie('access_token', newAccessToken, {
                        httpOnly: true,
                    });
                }
                return false;
            }
            else if (accessExp <= currentTimeInSeconds &&
                refreshExp <= currentTimeInSeconds) {
                throw new common_1.UnauthorizedException('All Tokens are invalid.');
            }
        }
        else if (path === '/auth/authenticate') {
            const user = await this.jwtService.verify(oldAccessToken);
            request.user = user;
            return request.user;
        }
    }
    extractAccessToken(request) {
        if (request.headers.authorization &&
            request.headers.authorization.split(' ')[0] === 'Bearer') {
            return request.headers.authorization.split(' ')[1];
        }
        else if (request.cookies && request.cookies['access_token']) {
            return request.cookies['access_token'];
        }
        return null;
    }
    extractExpiration(token) {
        const parts = token.split('.');
        const encodedPayload = parts[1];
        const decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
        const payloadObj = JSON.parse(decodedPayload);
        return payloadObj.exp;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        auth_service_1.AuthService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map