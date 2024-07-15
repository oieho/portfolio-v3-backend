import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = createClient({
          url: 'redis://localhost:6379', // Redis 서버 주소와 포트
          password: process.env.REDIS_PASS,
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
        client.connect(); // 클라이언트 연결
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
