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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("../auth/auth.service");
const user_service_1 = require("./user.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_dto_1 = require("./dto/user.dto");
let UserController = class UserController {
    constructor(authService, userService, jwtService) {
        this.authService = authService;
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async register(userDto) {
        return await this.userService.register(userDto);
    }
    async modifyUserByUserId(userId, userDto) {
        return this.userService.modifyUserByUserId(userId, userDto);
    }
    async getMyInfo(userId, request, response) {
        console.log(userId);
        const accessToken = (await this.authService.getAccessToken(userId));
        const refreshToken = await request.cookies['refresh_token'];
        console.log('accessToken::', accessToken);
        console.log('refreshToken::', refreshToken);
        if ((!accessToken && !refreshToken) ||
            (accessToken === null && refreshToken === undefined)) {
            console.log("isn't authorized.");
            throw new common_1.UnauthorizedException('No tokens were found.');
        }
        let token = accessToken;
        if (accessToken === null) {
            token = refreshToken;
        }
        let extractedJwtClaims;
        try {
            extractedJwtClaims = this.jwtService.verify(token);
        }
        catch (error) {
            console.log('ERROR::' + error);
            throw new common_1.UnauthorizedException('Invalid token.');
        }
        const user = await this.authService.extractUserInfoFromPayload(extractedJwtClaims);
        const member = await this.userService.readUserInfo(user.userId);
        console.log('member::' + member);
        return response.status(200).json(member);
    }
    async confirmUserName(name) {
        const result = await this.userService.findUserName(name);
        return result;
    }
    async confirmUserEmail(email) {
        const result = await this.userService.findUserEmail(email);
        return result;
    }
    async confirmIfMatchNameAndEmail(name, email) {
        const result = await this.userService.existsByUserNameAndUserEmail(name, email);
        return result;
    }
    create(createUserDto) {
        return this.userService.create(createUserDto);
    }
    findAll() {
        return this.userService.findAll();
    }
    findOne(userId) {
        return this.userService.findOne(+userId);
    }
    update(userId, updateUserDto) {
        return this.userService.update(+userId, updateUserDto);
    }
    remove(userId) {
        return this.userService.remove(+userId);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Put)('/modify/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "modifyUserByUserId", null);
__decorate([
    (0, common_1.Get)('userInfo'),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyInfo", null);
__decorate([
    (0, common_1.Post)('nameChk'),
    __param(0, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "confirmUserName", null);
__decorate([
    (0, common_1.Post)('emailChk'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "confirmUserEmail", null);
__decorate([
    (0, common_1.Post)('ifMatchNameAndEmail'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "confirmIfMatchNameAndEmail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService,
        jwt_1.JwtService])
], UserController);
//# sourceMappingURL=user.controller.js.map