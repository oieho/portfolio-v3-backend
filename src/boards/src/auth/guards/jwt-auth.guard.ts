import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AuthTokenDto, LoginDto, RefreshTokenDto } from '../dto/auth.dto';
import * as jwt from 'jsonwebtoken';

interface Payload {
  userId: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(
    // passport의 strategy패턴을 사용할 경우 토큰이 없을 경우 Access token not valid 메세지를 내보낼 수 없으므로 canActivate를 사용
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const path = request.route.path;

    const oldAccessToken = this.extractAccessToken(request);
    const oldRefreshToken = request.cookies['refresh_token'];

    const accessExp = this.extractExpiration(oldAccessToken);
    const refreshExp = this.extractExpiration(oldRefreshToken);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    if (path !== '/authenticate') {
      if (
        accessExp > currentTimeInSeconds &&
        refreshExp <= currentTimeInSeconds
      ) {
        try {
          const verifiedAccessToken = this.jwtService.verify(oldAccessToken);
          const userInfo =
            await this.authService.extractUserInfoFromPayload(
              verifiedAccessToken,
            );

          const newRefreshToken =
            await this.authService.generateRefreshToken(userInfo);
          this.authService.setCurrentRefreshToken(
            verifiedAccessToken.userId,
            newRefreshToken,
          );
          response.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
          });
          return false;
        } catch (error) {
          console.error('Invalid Access token', error.message);
        }
      } else if (
        accessExp <= currentTimeInSeconds &&
        refreshExp > currentTimeInSeconds
      ) {
        const verifiedRefreshToken = this.jwtService.verify(
          oldRefreshToken as string,
          {
            secret: process.env.JWT_REFRESH_SECRET,
          },
        ) as any | null;
        const userInfo =
          await this.authService.extractUserInfoFromPayload(
            verifiedRefreshToken,
          );
        let refreshTokenInDB = await this.authService.getRefreshTokenByUserId(
          userInfo.userId,
        );
        const matchedRefreshToken =
          await this.authService.getUserIfRefreshTokenMatches(
            oldRefreshToken,
            refreshTokenInDB.currentRefreshToken,
          );
        if (matchedRefreshToken) {
          const newAccessToken =
            await this.authService.generateAccessToken(userInfo);
          response.setHeader('Authorization', 'Bearer ' + newAccessToken);
          response.cookie('access_token', newAccessToken, {
            httpOnly: true,
          });
        }
        return false;
      } else if (
        accessExp <= currentTimeInSeconds &&
        refreshExp <= currentTimeInSeconds
      ) {
        throw new UnauthorizedException('All Tokens are invalid.');
      }
    }
    return true;
  }

  private extractAccessToken(request: any): string | null {
    if (
      request.headers.authorization &&
      request.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      return request.headers.authorization.split(' ')[1];
    } else if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'];
    }
    return null;
  }

  private extractExpiration(token: string) {
    const parts = token.split('.');
    const encodedPayload = parts[1];
    const decodedPayload = Buffer.from(encodedPayload, 'base64').toString(
      'utf-8',
    );
    const payloadObj = JSON.parse(decodedPayload);
    return payloadObj.exp;
  }
}
