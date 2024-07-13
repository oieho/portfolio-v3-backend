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
      await this.emailService.sendEmail(
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
