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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const user_repository_1 = require("./user.repository");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async register(userDto) {
        const userId = await this.findUser(userDto.userId);
        if (userId) {
            throw new common_1.HttpException('해당 유저가 이미 있습니다.', common_1.HttpStatus.BAD_REQUEST);
        }
        const encryptedPassword = bcrypt.hashSync(userDto.password, 10);
        console.log(encryptedPassword);
        try {
            const user = await this.createUser({
                ...userDto,
                password: encryptedPassword,
                role: 'member',
                joinDate: new Date(),
                modDate: new Date(),
            });
            user.password = undefined;
            return user;
        }
        catch (error) {
            throw new common_1.HttpException('서버 에러 : ' + error, 500);
        }
    }
    async modifyUserByUserId(userId, userDto) {
        const user = await this.findUser(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found!');
        }
        if (!(await bcrypt.compare(userDto.password, user.password))) {
            throw new common_1.BadRequestException('Invalid password!');
        }
        userDto.password = bcrypt.hashSync(userDto.password, 10);
        return this.userRepository.findByUserIdAndUpdate(userId, userDto);
    }
    async findUser(userId) {
        const result = await this.userRepository.findUser(userId);
        return result;
    }
    async readUserInfo(user) {
        const result = await this.userRepository.findUser(user);
        console.log('RESULT::' + result);
        return result;
    }
    createUser(user) {
        return this.userRepository.saveUser(user);
    }
    create(createUserDto) {
        return 'This action adds a new user';
    }
    findAll() {
        return `This action returns all user`;
    }
    findOne(userId) {
        return `This action returns a #${userId} user`;
    }
    update(userId, updateUserDto) {
        return `This action updates a #${userId} user`;
    }
    remove(userId) {
        return `This action removes a #${userId} user`;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserMongoRepository])
], UserService);
//# sourceMappingURL=user.service.js.map