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
exports.UserMongoRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
let UserMongoRepository = class UserMongoRepository {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findUser(userId) {
        return await this.userModel.findOne({ userId });
    }
    async saveUser(user) {
        const newUser = new this.userModel(user);
        return await newUser.save();
    }
    async findByUserIdAndUpdate(userId, userDto) {
        userDto.modDate = new Date();
        try {
            const updatedUser = await this.userModel.findOneAndUpdate({ userId }, userDto, { new: true });
            return updatedUser;
        }
        catch (error) {
            throw new Error(`Failed to update user with userId ${userId}: ${error.message}`);
        }
    }
    async getAllPost() {
        const users = await this.userModel.find().exec();
        return users.map((user) => this.toUserDto(user));
    }
    async createPost(postDto) {
        const createPost = {
            ...postDto,
            createdDt: new Date(),
            updatedDt: new Date(),
        };
        await this.userModel.create(createPost);
    }
    async deletePost(userId) {
        await this.userModel.findByIdAndDelete(userId);
    }
    toUserDto(user) {
        return {
            userId: user.userId,
            password: user.password,
            email: user.email,
            name: user.name,
            socialMedia: user.socialMedia,
            role: user.role,
            joinDate: user.joinDate,
            modDate: user.modDate,
        };
    }
};
exports.UserMongoRepository = UserMongoRepository;
exports.UserMongoRepository = UserMongoRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserMongoRepository);
//# sourceMappingURL=user.repository.js.map