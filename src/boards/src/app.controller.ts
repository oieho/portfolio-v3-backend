import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('hello')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Hello World API',
    description: '간단한 Hello World 메시지를 반환합니다.',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
