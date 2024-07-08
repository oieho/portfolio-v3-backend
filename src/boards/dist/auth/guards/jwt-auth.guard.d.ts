import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly configService;
    private readonly jwtService;
    private readonly authService;
    constructor(configService: ConfigService, jwtService: JwtService, authService: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractAccessToken;
    private extractExpiration;
}
