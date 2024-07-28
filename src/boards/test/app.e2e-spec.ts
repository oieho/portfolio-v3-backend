import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import bcrypt from 'bcrypt';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('User Tests', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should register 100 users', async () => {
    for (let i = 1; i <= 100; i++) {
      const userDto = {
        userId: `user${i}`,
        password: '1',
        email: `user${i}@oieho.com`,
        name: `사용자${i}`,
        socialMedia: 'LOCAL',
        role: 'Member',
        joinDate: new Date(),
        modDate: new Date(),
      };
      const response = await request(app.getHttpServer())
        .post('/user/join')
        .send({
          ...userDto,
        });
      expect(response.status).toBe(201); // 성공적인 생성의 경우 상태 코드는 201
      expect(response.body).toHaveProperty('userId'); // 응답에 사용자 ID가 포함되어 있는지 확인
    }
  });
});
