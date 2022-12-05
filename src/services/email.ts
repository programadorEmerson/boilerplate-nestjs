import * as nodemailer from 'nodemailer';

import { ConstantsEnum } from 'src/enums/constants';

import { emailConfirmation } from 'src/html/emailConfirmation';

class Email {
  sendEmailConfirmation = async (email: string, code: string) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SERVER_UMBLER,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_REF,
        pass: process.env.PASS_EMAIL_REF,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      text: process.env.APP_NAME,
      subject: `${ConstantsEnum.CODE_OF_CONFIRMATION} ${process.env.APP_NAME}`,
      from: `${ConstantsEnum.NO_REPLY} < ${process.env.EMAIL_REF} >`,
      to: email,
      html: emailConfirmation(code),
    });
    console.log(ConstantsEnum.SUCESS_SEND_EMAIL);
  };
}

export default Email;
