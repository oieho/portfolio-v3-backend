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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_repository_1 = require("./auth.repository");
let AuthService = class AuthService {
    constructor(userService, jwtService, configService, authRepository, redisClient) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.authRepository = authRepository;
        this.redisClient = redisClient;
    }
    async validateUser(loginDto) {
        const user = await this.userService.findUser(loginDto.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found!');
        }
        if (!(await bcrypt.compare(loginDto.password, user.password))) {
            console.log(loginDto.password);
            console.log(user.password);
            throw new common_1.BadRequestException('Invalid credentials!');
        }
        console.log(user);
        return user;
    }
    async generateAccessToken(user) {
        const payload = {
            userId: user.userId,
            role: 'LOCAL',
        };
        return await this.jwtService.signAsync({ userId: payload.userId, role: payload.role }, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
        });
    }
    async saveAccessToken(userId, token) {
        await this.redisClient.set(`access_token:${userId}`, token, {
            EX: 3600,
        });
    }
    async getAccessToken(userId) {
        return this.redisClient.get(`access_token:${userId}`);
    }
    async deleteAccessToken(userId) {
        await this.redisClient.del(`access_token:${userId}`);
    }
    async generateRefreshToken(user) {
        try {
            const payload = {
                userId: user.userId,
                role: user.role ? user.role : 'LOCAL',
            };
            return await this.jwtService.signAsync({ userId: payload.userId, role: payload.role }, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
            });
        }
        catch (error) {
            console.log(error);
        }
    }
    async setCurrentRefreshToken(userId, refreshToken) {
        const currentRefreshToken = await this.getCurrentHashedRefreshToken(refreshToken);
        const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp();
        await this.authRepository.updateRefreshToken(userId, {
            currentRefreshToken: currentRefreshToken,
            currentRefreshTokenExp: currentRefreshTokenExp,
        });
    }
    async getRefreshTokenByUserId(userId) {
        try {
            const refreshTokenInfo = await this.authRepository.getRefreshToken(userId);
            if (!refreshTokenInfo) {
                return null;
            }
            const refreshTokenDto = {
                userId: refreshTokenInfo.userId,
                currentRefreshToken: refreshTokenInfo.currentRefreshToken,
                currentRefreshTokenExp: refreshTokenInfo.currentRefreshTokenExp,
            };
            return refreshTokenDto;
        }
        catch (error) {
            console.error('Failed to get refresh token:', error);
            return null;
        }
    }
    async getCurrentHashedRefreshToken(refreshToken) {
        const saltOrRounds = 10;
        const currentRefreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
        return currentRefreshToken;
    }
    async getCurrentRefreshTokenExp() {
        const currentDate = new Date();
        const currentRefreshTokenExp = new Date(currentDate.getTime() +
            parseInt(this.configService.get('JWT_REFRESH_EXPIRATION_TIME')));
        return currentRefreshTokenExp;
    }
    async getUserIfRefreshTokenMatches(currentRefreshTokenByCookie, oldRefreshTokenInDB) {
        const isRefreshTokenMatching = await bcrypt.compare(currentRefreshTokenByCookie, oldRefreshTokenInDB);
        if (isRefreshTokenMatching) {
            return true;
        }
    }
    async extractUserInfoFromPayload(payload) {
        try {
            if (payload && payload?.userId && payload.role) {
                return {
                    userId: payload.userId,
                    role: payload.role,
                };
            }
            return null;
        }
        catch (error) {
            console.error('페이로드 처리 중 오류:', error);
            return null;
        }
    }
    async removeRefreshToken(userId) {
        return await this.authRepository.delete(userId);
    }
    findAll() {
        return `This action returns all auth`;
    }
    findOne(userId) {
        return `This action returns a #${userId} auth`;
    }
    update(userId, updateAuthDto) {
        return `This action updates a #${userId} auth`;
    }
    remove(userId) {
        return `This action removes a #${userId} auth`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        config_1.ConfigService,
        auth_repository_1.AuthMongoRepository, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map