import {
  UseGuards,
  Controller,
  Get,
  Post,
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
import { AuthTokenDto, LoginDto } from './dto/auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from './../user/user.service';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import {
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { AuthService, JwtAuthGuard, JwtRefreshGuard, UserService } from '@backend/domain';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '로그인 성공시 access/refresh Tokens 발급',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'user1' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['name', 'password'],
    },
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '요청 성공시',
    type: Response,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const user = await this.authService.validateUser(loginDto);
    const access_token = await this.authService.generateAccessToken(user);
    const refresh_token = await this.authService.generateRefreshToken(user);
    // 유저 객체에 refresh-token 데이터 저장
    await this.authService.setCurrentRefreshToken(user.userId, refresh_token);

    res.setHeader('authorization', 'Bearer ' + [access_token]);
    await this.authService.saveAccessToken(user.userId, access_token);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    });

    return {
      message: 'login success',
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  @ApiOperation({
    summary: '로그아웃',
    description:
      '로그아웃시 access/refresh Tokens의 쿠키(refresh) 및 redis키값(access) 제거',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        userId: 'user11',
      },
    },
  })
  @Post('logout')
  async logout(@Body() req: any, @Res() res: Response): Promise<any> {
    const userId = req.userId;
    await this.authService.removeRefreshToken(userId);
    await this.authService.deleteAccessToken(userId);

    res.clearCookie('refresh_token');
    return res.send({
      message: 'logout success',
    });
  }

  @ApiOperation({
    summary: '회원 인증',
    description: 'access토큰이 유효하면 토큰 클레임에서 userID를 추출해서 반환',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        userId: 'user11',
      },
    },
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'access/refresh 토큰이 유효하지 않으므로 정보조회 실패',
  })
  @Get('authenticate')
  @UseGuards(JwtAuthGuard)
  async user(@Req() req: any, @Res() res: Response): Promise<object> {
    const verifiedUser: Object = await this.userService.findUser(
      req.user.userId,
    );
    console.log('@@', verifiedUser); // 객체 전체를 출력

    return res.send(verifiedUser);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.authService.findOne(+userId);
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateAuthDto: UpdateAuthDto,
  ) {
    return this.authService.update(+userId, updateAuthDto);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.authService.remove(+userId);
  }

  @ApiOperation({
    summary: '새로고침 함수',
    description:
      'accessToken이 유효하면 refreshToken(2주) 발급/accessToken이 유효하지 않으며 refreshToken이 DB에 존재하지 않을 경우 accessToken을 미발행/access Token 이 만료되고 refresh Token이 유효하면 access Token 재발행/accessToken이 만료되고 refreshToken도 만료될 경우 헤더에 invalidTokenAccess 리턴/access,refresh가 만료되지 않았으며 refreshToken기간이 3일 이하로 남은 경우, refreshToken 재갱신',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        userId: 'user11',
        role: 'member',
      },
    },
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'access/refresh 토큰이 유효하지 않으므로 정보조회 실패',
  })
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(
    user: AuthTokenDto,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    try {
      function isRefreshTokenExpired(expirationDate: Date): boolean {
        const currentDate = new Date();
        const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3일을 밀리초로 계산
        const thresholdDate = new Date(
          currentDate.getTime() + threeDaysInMilliseconds,
        );

        return expirationDate <= thresholdDate;
      }

      const refreshToken = await this.authService.getRefreshTokenByUserId(
        user?.userId,
      );
      if (
        refreshToken?.currentRefreshTokenExp &&
        isRefreshTokenExpired(refreshToken?.currentRefreshTokenExp)
      ) {
        console.log('3일 이하 리프레시 토큰 재발급');
        const refresh_token = await this.authService.generateRefreshToken(user);
        await this.authService.setCurrentRefreshToken(
          user.userId,
          refresh_token,
        );

        res.cookie('refresh_token', refresh_token, {
          httpOnly: true,
        });
      }
      return { message: 'Token refreshed successfully' };
    } catch (error) {
      return { message: 'Token operation failed' + error };
    }
  }
}
