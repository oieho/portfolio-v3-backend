/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import { RefreshTokenDto } from './../auth/dto/auth.dto';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { RefreshTokenDocument } from '../schemas/refresh-token.schema';
export interface AuthRepository {
    updateRefreshToken(userId: string, currentRefreshTokenSet: {
        currentRefreshToken: string;
        currentRefreshTokenExp: Date;
    }): any;
}
export declare class AuthMongoRepository implements AuthRepository {
    private userModel;
    private refreshTokenModel;
    constructor(userModel: Model<UserDocument>, refreshTokenModel: Model<RefreshTokenDocument>);
    getRefreshToken(userId: string): Promise<RefreshTokenDto>;
    updateRefreshToken(userId: String, currentRefreshTokenSet: {
        currentRefreshToken: string;
        currentRefreshTokenExp: Date;
    }): Promise<void>;
    delete(userId: string): Promise<any>;
}
