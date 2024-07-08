import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

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
      const result = await this.emailService.sendEmail(
        sender,
        subject,
        emailAddress,
        content,
        file,
        files,
      );
      return { message: 'Email sent successfully!', result };
    } catch (error) {
      return { message: 'Failed to send email.', error };
    }
  }
}
