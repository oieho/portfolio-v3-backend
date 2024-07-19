import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request, Response } from 'express';

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

    const oldAccessToken = await this.authService.getAccessToken(
      request.body.userId,
    );
    const oldRefreshToken = request.cookies['refresh_token'];

    const accessExp = this.extractExpiration(oldAccessToken);
    const refreshExp = this.extractExpiration(oldRefreshToken);
    console.log(accessExp, refreshExp);
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    if (path !== '/auth/authenticate') {
      if (
        accessExp > currentTimeInSeconds &&
        refreshExp > currentTimeInSeconds
      ) {
        return false; // 가드에서 핸들러로 진입 안함
      } else if (
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
          await this.authService.saveAccessToken(
            userInfo.userId,
            newAccessToken,
          );
        }
        return false;
      } else if (
        accessExp <= currentTimeInSeconds &&
        refreshExp <= currentTimeInSeconds
      ) {
        throw new UnauthorizedException('All Tokens are invalid.');
      }
    } else if (path === '/auth/authenticate') {
      const user = await this.jwtService.verify(oldAccessToken);
      request.user = user;
      return request.user;
    }
  }

  private extractExpiration(token: string) {
    let payloadObj = null;

    if (token === null) {
      const now = new Date();
      const unixTimestamp = Math.floor(now.getTime() / 1000);
      payloadObj = { exp: unixTimestamp };
    } else {
      const parts = token.split('.');
      const encodedPayload = parts[1];
      const decodedPayload = Buffer.from(encodedPayload, 'base64').toString(
        'utf-8',
      );
      payloadObj = JSON.parse(decodedPayload);
    }
    return payloadObj.exp;
  }
}
