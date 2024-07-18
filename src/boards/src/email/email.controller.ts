import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmailService } from './email.service';
import { ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('이메일 API')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({
    summary: '관리자 이메일로 메일 전송',
    description: '단일/다중 파일 첨부 가능',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        file: undefined,
        files: [],
        sender: '사용자11',
        subject: '이메일 제목',
        emailAddress: 'user@email.com',
        content: '본문 내용',
      },
    },
  })
  @Post('/send')
  @UseInterceptors(FileInterceptor('file')) // 'file'은 파일 필드의 이름입니다.
  async sendEmail(
    @UploadedFile() file: Express.Multer.File, // 업로드된 파일
    @UploadedFile() files: Express.Multer.File[], // 업로드된 파일
    @Body('sender') sender: string,
    @Body('subject') subject: string,
    @Body('emailAddress') emailAddress: string,
    @Body('content') content: string,
  ): Promise<any> {
    try {
      await this.emailService.sendAnEmail(
        sender,
        subject,
        emailAddress,
        content,
        file,
        files,
      );
      return { message: 'Email sent successfully!' };
    } catch (error) {
      return { message: 'Failed to send email.', error };
    }
  }

  @ApiOperation({
    summary: '이름으로 회원 아이디 찾기',
    description: 'DB에 회원 이름이이 있는지 확인한 후 이메일로 아이디 전송',
  })
  @ApiBody({
    required: true,
    schema: {
      example: {
        name: '사용자11',
      },
    },
  })
  @Post('/sendEmailToFindId')
  async findId(
    @Body('name') name: string,
    @Body('email') email: string,
  ): Promise<any> {
    try {
      await this.emailService.sendEmailToFindTheID(name, email);

      return {
        message: 'By sending the email, find the ID. Email sent successfully!',
      };
    } catch (error) {
      return { message: 'Failed to send the email to find the ID.', error };
    }
  }
}
