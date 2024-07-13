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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_dto_1 = require("./dto/auth.dto");
const update_auth_dto_1 = require("./dto/update-auth.dto");
const user_service_1 = require("./../user/user.service");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async login(loginDto, res) {
        const user = await this.authService.validateUser(loginDto);
        const access_token = await this.authService.generateAccessToken(user);
        const refresh_token = await this.authService.generateRefreshToken(user);
        await this.authService.setCurrentRefreshToken(user.userId, refresh_token);
        res.setHeader('authorization', 'Bearer ' + [access_token]);
        await this.authService.saveAccessToken(user.userId, access_token);
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
        });
        return {
            message: 'login success',
            access_token: access_token,
            refresh_token: refresh_token,
        };
    }
    async logout(req, res) {
        const userId = req.userId;
        await this.authService.removeRefreshToken(userId);
        await this.authService.deleteAccessToken(userId);
        res.clearCookie('refresh_token');
        return res.send({
            message: 'logout success',
        });
    }
    async user(req, res) {
        const verifiedUser = await this.userService.findUser(req.user.userId);
        console.log('@@', verifiedUser);
        return res.send(verifiedUser);
    }
    findAll() {
        return this.authService.findAll();
    }
    findOne(userId) {
        return this.authService.findOne(+userId);
    }
    update(userId, updateAuthDto) {
        return this.authService.update(+userId, updateAuthDto);
    }
    remove(userId) {
        return this.authService.remove(+userId);
    }
    async refresh(user, res) {
        try {
            function isRefreshTokenExpired(expirationDate) {
                const currentDate = new Date();
                const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000;
                const thresholdDate = new Date(currentDate.getTime() + threeDaysInMilliseconds);
                return expirationDate <= thresholdDate;
            }
            const refreshToken = await this.authService.getRefreshTokenByUserId(user?.userId);
            if (refreshToken?.currentRefreshTokenExp &&
                isRefreshTokenExpired(refreshToken?.currentRefreshTokenExp)) {
                console.log('3일 이하 리프레시 토큰 재발급');
                const refresh_token = await this.authService.generateRefreshToken(user);
                await this.authService.setCurrentRefreshToken(user.userId, refresh_token);
                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                });
            }
            return { message: 'Token refreshed successfully' };
        }
        catch (error) {
            return { message: 'Token operation failed' + error };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: '로그인',
        description: '로그인 성공시 access/refresh Tokens 발급',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'user1' },
                password: { type: 'string', example: 'password123' },
            },
            required: ['name', 'password'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('authenticate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "user", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_auth_dto_1.UpdateAuthDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map