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
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
// import { AuthService, JwtAuthGuard, JwtRefreshGuard, UserService } from '@backend/domain';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(200)
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
    res.cookie('access_token', access_token, {
      httpOnly: true,
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    });
    return {
      message: 'login success',
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  @Post('logout')
  async logout(@Req() req: any, @Res() res: Response): Promise<any> {
    await this.authService.removeRefreshToken(req.user.id);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send({
      message: 'logout success',
    });
  }

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

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(
    user: AuthTokenDto,
    @Res({ passthrough: true }) res: Response,
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
