import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto, UserIdDto } from './dto/user.dto';
import { UserMongoRepository } from './user.repository';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: UserMongoRepository);
    register(userDto: UserDto): Promise<UserDto>;
    modifyUserByUserId(userId: string, userDto: UserDto): Promise<UserDto>;
    findUser(userId: any): Promise<UserIdDto | any>;
    readUserInfo(user: string): Promise<UserDto>;
    createUser(user: any): Promise<UserDto>;
    create(createUserDto: CreateUserDto): string;
    findAll(): string;
    findOne(userId: number): string;
    update(userId: number, updateUserDto: UpdateUserDto): string;
    remove(userId: number): string;
}
