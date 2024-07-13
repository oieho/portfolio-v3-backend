import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UserMongoRepository } from './user.repository';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: UserMongoRepository);
    register(userDto: UserDto): Promise<UserDto>;
    modifyUserByUserId(userId: string, userDto: UserDto): Promise<UserDto>;
    findUser(userId: string): Promise<string | any>;
    findUserId(name: string): Promise<string>;
    findUserName(name: string): Promise<boolean>;
    findUserEmail(email: string): Promise<boolean>;
    existsByUserNameAndUserEmail(name: string, email: string): Promise<boolean>;
    readUserInfo(userId: string): Promise<UserDto>;
    createUser(user: any): Promise<UserDto>;
    create(createUserDto: CreateUserDto): string;
    findAll(): string;
    findOne(userId: number): string;
    update(userId: number, updateUserDto: UpdateUserDto): string;
    remove(userId: number): string;
}
