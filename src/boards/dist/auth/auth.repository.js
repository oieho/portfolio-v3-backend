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
exports.AuthMongoRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const refresh_token_schema_1 = require("../schemas/refresh-token.schema");
let AuthMongoRepository = class AuthMongoRepository {
    constructor(userModel, refreshTokenModel) {
        this.userModel = userModel;
        this.refreshTokenModel = refreshTokenModel;
    }
    async getRefreshToken(userId) {
        return await this.refreshTokenModel.findOne({ userId });
    }
    async updateRefreshToken(userId, currentRefreshTokenSet) {
        await this.refreshTokenModel.findOneAndUpdate({ userId }, {
            currentRefreshToken: currentRefreshTokenSet.currentRefreshToken,
            currentRefreshTokenExp: currentRefreshTokenSet.currentRefreshTokenExp,
        }, { upsert: true });
    }
    async delete(userId) {
        return await this.refreshTokenModel.deleteOne({ userId: userId });
    }
};
exports.AuthMongoRepository = AuthMongoRepository;
exports.AuthMongoRepository = AuthMongoRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(refresh_token_schema_1.RefreshToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AuthMongoRepository);
//# sourceMappingURL=auth.repository.js.map