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
import { UserIdAndPasswordDto } from './dto/user.dto';
import { UserDto } from './dto/user.dto';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
export interface UserRepository {
    findUser(userId: string): Promise<UserDto>;
    getAllPost(): Promise<UserDto[]>;
    createPost(postDto: UserIdAndPasswordDto): any;
    deletePost(userId: string): any;
}
export declare class UserMongoRepository implements UserRepository {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findUser(userId: string): Promise<UserDto | any>;
    findUserId(name: string): Promise<any>;
    findUserName(name: string): Promise<any>;
    findUserEmail(email: string): Promise<any>;
    findUserNameAndUserEmail(name: string, email: string): Promise<Object>;
    saveUser(user: UserDto): Promise<UserDto>;
    findByUserIdAndUpdate(userId: string, userDto: UserDto): Promise<UserDto>;
    getAllPost(): Promise<UserDto[]>;
    createPost(postDto: UserIdAndPasswordDto): Promise<void>;
    deletePost(userId: string): Promise<void>;
    private toUserDto;
}
