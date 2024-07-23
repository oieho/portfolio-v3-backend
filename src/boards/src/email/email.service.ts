import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from '../user/user.service';
import { Express } from 'express';

@Injectable()
export class EmailService {
  constructor(
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  async sendAnEmail(
    sender: string,
    subject: string,
    emailAddress: string,
    content: string,
    file: Express.Multer.File | undefined,
    files: Express.Multer.File[],
  ): Promise<any> {
    let attachments = [];

    // file이 존재하면 배열에 추가
    if (file) {
      attachments.push({
        filename: file.originalname,
        content: file.buffer,
      });
    }

    // files가 존재하면 배열에 추가
    if (files && files.length > 0) {
      attachments = [
        ...attachments,
        ...files.map((f) => ({
          filename: f.originalname,
          content: f.buffer,
        })),
      ];
    }

    const mailOptions = {
      to: 'oiehomail@gmail.com',
      subject:
        subject + '   -   보낸사람 : ' + sender + '(' + emailAddress + ')',
      text: content,
      attachments: attachments.length > 0 ? attachments : [],
    };

    try {
      return await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendEmailToFindTheID(name: string, email: string): Promise<any> {
    const id = await this.userService.findUserId(name);
    const mailOptions = {
      to: email,
      subject: 'OIEHO 아이디 찾기 메일입니다.',
      html: `
      <p>아이디 찾기를 요청하셨습니다. 아이디는 다음과 같습니다.</p>
      <br>
      <span style='font-size:2rem;font-weight:bold;'>${id}</span>
    `,
    };
    try {
      await this.mailerService.sendMail(mailOptions);
      return;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendEmailToFindThePassword(
    email: string,
    token: string,
  ): Promise<void> {
    const mailOptions = {
      to: email,
      subject: 'OIEHO 비밀번호 찾기 인증 메일입니다.',
      html: `
        <p>비밀번호 찾기를 요청하셨을 경우 아래에 있는 인증버튼을 누르시기 바랍니다.</p>
        <p>인증완료 후 <b>홈페이지로 돌아간 후 비밀번호를 변경</b>하시기 바랍니다.</p>
        <br>
        <a href='http://localhost:4000/user/password/verify/${token}'>
          <span style="width:120%;height:100%;border: 1px solid #000; padding: 0.6rem;border-radius:1rem;background-color:black;color:#fff;font-size: 0.85rem;">인증하기</span>
        </a>
      `,
    };
    try {
      await this.mailerService.sendMail(mailOptions);
      return;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
