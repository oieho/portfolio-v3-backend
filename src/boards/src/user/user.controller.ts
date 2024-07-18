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
import {
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('사용자 API')
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: '회원 가입', description: '회원 생성' })
  @ApiBody({
    required: true,
    schema: {
      example: {
        userId: 'user11',
        password: process.env.USER11_PASSWORD,
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'member',
        joinDate: new Date(),
        modDate: new Date(),
      },
    },
  })
  @ApiCreatedResponse({ description: '회원가입 성공', type: UserDto })
  @Post('join')
  async register(@Body() userDto: UserDto) {
    return await this.userService.register(userDto);
  }

  @ApiOperation({
    summary: '회원정보 수정',
    description: 'userID에 해당하는 회원 정보 수정',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: '사용자ID로 User엔티티 조회',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        password: process.env.USER11_PASSWORD,
        email: 'user11@oieho.com',
        name: '사용자11',
        socialMedia: 'LOCAL',
        role: 'member',
        joinDate: new Date(),
        modDate: new Date(),
      },
    },
  })
  @Put('/modify/:userId')
  async modifyUserByUserId(
    @Param('userId') userId: string,
    @Body() userDto: UserDto,
  ): Promise<UserDto> {
    return this.userService.modifyUserByUserId(userId, userDto);
  }

  @ApiResponse({
    status: 200,
    description: '요청 성공시',
    type: Response,
  })
  @ApiResponse({
    status: 401,
    description: '요청 실패시',
    type: Response,
  })
  @ApiUnauthorizedResponse({
    description: 'access/refresh 토큰이 유효하지 않으므로 정보조회 실패',
  })
  @ApiOperation({
    summary: '회원정보 조회',
    description:
      'jwt token이 유효할 경우 토큰에서 사용자ID Claims을 추출하여 회원정보 조회 ',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        userId: 'user11',
      },
    },
  })
  @Get('userInfo')
  async getMyInfo(
    @Body('userId') userId: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    // const accessToken = request.headers['authorization'] as string;
    console.log(userId);
    const accessToken = (await this.authService.getAccessToken(userId)) as any;
    const refreshToken = await request.cookies['refresh_token'];

    console.log('accessToken::', accessToken);
    console.log('refreshToken::', refreshToken);

    if (
      (!accessToken && !refreshToken) ||
      (accessToken === null && refreshToken === undefined)
    ) {
      console.log("isn't authorized.");
      throw new UnauthorizedException('No tokens were found.');
    }

    let token = accessToken;
    if (accessToken === null) {
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

  @ApiOperation({
    summary: '회원이름 확인',
    description: 'DB에 회원 이름이 있는지 확인한 후 true/false 반환',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        name: '사용자11',
      },
    },
  })
  @Post('nameChk')
  async confirmUserName(@Body('name') name: string): Promise<boolean> {
    const result = await this.userService.findUserName(name);
    return result;
  }

  @ApiOperation({
    summary: '회원이메일 확인',
    description: 'DB에 회원 이메일이 있는지 확인한 후 true/false 반환',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        email: 'user11@oieho.com',
      },
    },
  })
  @Post('emailChk')
  async confirmUserEmail(@Body('email') email: string): Promise<boolean> {
    const result = await this.userService.findUserEmail(email);
    return result;
  }

  @ApiOperation({
    summary: '회원이름과 이메일이 함께 일치하는 회원이 있는지 확인',
    description:
      'DB에 회원 이름과 이메일이 함께 일치하는지 확인 후 true/false 반환',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        name: '사용자11',
        email: 'user11@oieho.com',
      },
    },
  })
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
