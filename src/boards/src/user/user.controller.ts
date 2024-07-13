import {
  UseGuards,
  Controller,
  Get,
  Post,
  Put,
  HttpCode,
  Body,
  Res,
  Patch,
  Param,
  Delete,
  Req,
  UseFilters,
  UnauthorizedException,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('join')
  async register(@Body() userDto: UserDto) {
    return await this.userService.register(userDto);
  }

  @Put('/modify/:userId')
  async modifyUserByUserId(
    @Param('userId') userId: string,
    @Body() userDto: UserDto,
  ): Promise<UserDto> {
    return this.userService.modifyUserByUserId(userId, userDto);
  }

  @Get('userInfo')
  async getMyInfo(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    // const accessToken = request.headers['authorization'] as string;
    const accessToken = request.cookies['access_token'];
    const refreshToken = request.cookies['refresh_token'];

    console.log('accessToken::', accessToken);
    console.log('refreshToken::', refreshToken);

    if (
      (!accessToken && !refreshToken) ||
      (accessToken === 'undefined' && refreshToken === undefined)
    ) {
      console.log("isn't authorized.");
      throw new UnauthorizedException('No tokens were found.');
    }

    let token = accessToken;
    if (accessToken === 'undefined') {
      // if (accessToken === 'Bearer undefined') {
      token = refreshToken;
    }
    let extractedJwtClaims;
    try {
      extractedJwtClaims = this.jwtService.verify(token);
    } catch (error) {
      console.log('ERROR::' + error);
      throw new UnauthorizedException('Invalid token.');
    }
    const user =
      await this.authService.extractUserInfoFromPayload(extractedJwtClaims);
    const member = await this.userService.readUserInfo(user.userId);
    console.log('member::' + member);

    return response.status(200).json(member);
  }

  @Post('nameChk')
  async confirmUserName(@Body('name') name: string): Promise<boolean> {
    const result = await this.userService.findUserName(name);
    return result;
  }

  @Post('emailChk')
  async confirmUserEmail(@Body('email') email: string): Promise<boolean> {
    const result = await this.userService.findUserEmail(email);
    return result;
  }

  @Post('ifMatchNameAndEmail')
  async confirmIfMatchNameAndEmail(
    @Body('name') name: string,
    @Body('email') email: string,
  ): Promise<boolean> {
    const result = await this.userService.existsByUserNameAndUserEmail(
      name,
      email,
    );
    return result;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.userService.findOne(+userId);
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+userId, updateUserDto);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.userService.remove(+userId);
  }
}
