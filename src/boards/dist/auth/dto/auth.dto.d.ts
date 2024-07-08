export declare class LoginDto {
    userId: string;
    password: string;
}
export declare class AuthTokenDto {
    userId: string;
    role: string;
}
export declare class RefreshTokenDto {
    userId: string;
    currentRefreshToken: string;
    currentRefreshTokenExp: Date;
}
