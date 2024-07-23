import {
  UseGuards,
  Controller,
  Get,
  Post,
  Put,
  HttpCode,
  HttpException,
  Body,
  Res,
  Patch,
  Param,
  Delete,
  Req,
  UseFilters,
  NotFoundException,
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
import { UserDto, UserIdAndPasswordDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
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
        role: 'Member',
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
        role: 'Member',
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
    summary: '발급 된 토큰 유효성 검증',
    description:
      '비밀번호 찾기 폼에서 아이디와 이메일 입력 후 통과되어 발급된 토큰(UUID)을 이메일로 검증',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        token: '사용자1df0654f1-c4b2-4aa2-ba62-6becd7f997ba1',
      },
    },
  })
  @Get('/QualifiedChangePass/:token')
  async verifyToken(@Param('token') token: string, @Res() res: Response) {
    try {
      const result = await this.userService.qualifyByToken(token);
      return res.status(HttpStatus.OK).send(result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.BAD_REQUEST).send('Not found Token.');
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: '비밀번호 변경 자격 부여',
    description:
      '발급한 토큰(UUID)이 DB에 저장 된 토큰과 일치할 경우 비밀번호 변경 허가',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        token: '사용자1df0654f1-c4b2-4aa2-ba62-6becd7f997ba1',
      },
    },
  })
  @Get('/AuthorizeChangePass/:token')
  async changePassAuthorization(
    @Param('token') token: string,
  ): Promise<boolean> {
    const validToken = await this.userService.verifyToken(token);
    if (validToken === true) {
      return true;
    }
  }

  @ApiOperation({
    summary: '발급 된 토큰 제거',
    description:
      '인증시간 초과 후 또는 인증에 성공하여 비밀번호 변경 후 토큰 제거',
  })
  @Delete('DeleteChangePass/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFindPasswordToken(@Param('token') token: string): Promise<void> {
    await this.userService.removeRecoverPassToken(token);
  }

  @ApiOperation({
    summary: '비밀번호 변경',
    description: '토큰이 검증된 후 비밀번호 변경',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        userId: 'user11',
        password: process.env.USER11_PASSWORD,
      },
    },
  })
  @Put('/changePW')
  async changePassword(
    @Body() user: UserIdAndPasswordDto,
    @Res() res: Response,
  ) {
    try {
      await this.userService.changePassword(user.userId, user.password);
      return res.status(HttpStatus.OK).send(true);
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(false);
    }
  }
}
