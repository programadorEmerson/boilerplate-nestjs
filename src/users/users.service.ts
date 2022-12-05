import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import * as bcrypt from 'bcrypt';

import { Model } from 'mongoose';

import { AuthService } from 'src/auth/auth.service';

import { ConstantsEnum } from 'src/enums/constants';
import { ErrorsEnum } from 'src/enums/errors';

import Email from 'src/services/email';

import { SigninUserDto } from 'src/users/dto/signin.user.dto/signin.user.dto';
import { SignupUserDto } from 'src/users/dto/signup.user.dto/signup.user.dto';
import { UpdateUserDto } from 'src/users/dto/update.user.dto/update.user.dto';
import { User } from 'src/users/models/users.model';
import generateCodeConfirmation from 'src/utils/generateCodeConfirmation';
import { keysSignup } from 'src/utils/keysToRemove';
import { removeRestrictKeys } from 'src/utils/removeRestrictKeys';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(ConstantsEnum.USER) private readonly userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  public async signUp(signupDto: SignupUserDto): Promise<User> {
    if (await this.userModel.findOne({ email: signupDto.email })) {
      throw new ConflictException(ErrorsEnum.USER_ALREADY_EXISTS);
    }
    const email = new Email();
    const codeConfirmation = generateCodeConfirmation();
    const newUser = new this.userModel({
      ...signupDto,
      codeConfirmation: codeConfirmation,
      createdAt: new Date().toISOString(),
      active: false,
    });
    email.sendEmailConfirmation(signupDto.email, String(codeConfirmation));
    return removeRestrictKeys(await newUser.save(), keysSignup);
  }

  public async signIn(
    signinDto: SigninUserDto,
  ): Promise<{ token: string; userInfo: User }> {
    const user = await this.findByEmail(signinDto.email);
    const match = await this.checkPassword(signinDto.password, user);
    if (!match) {
      throw new NotFoundException(ErrorsEnum.INVALID_PASS_OR_EMAIL);
    }
    const token = await this.authService.createAccessToken(user._id);
    return { token, userInfo: removeRestrictKeys(user, keysSignup) };
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException(ErrorsEnum.INVALID_PASS_OR_EMAIL);
    }
    return user;
  }

  private async checkPassword(password: string, user: User): Promise<boolean> {
    const match = bcrypt.compare(password, user.password);
    if (!match) {
      throw new NotFoundException(ErrorsEnum.INVALID_PASS_OR_EMAIL);
    }
    return match;
  }

  public async findAllUsers(requesterId: string): Promise<User[]> {
    const users = await this.userModel.find();
    return users
      .map((user) => removeRestrictKeys(user, keysSignup))
      .filter((user) => String(user._id) !== requesterId);
  }

  public async deleteUserById(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException(ErrorsEnum.USER_NOT_FOUND);
    }
    await this.userModel.findByIdAndDelete(id);
    return removeRestrictKeys(user, keysSignup);
  }

  public async confirmCode(email: string, code: string): Promise<User> {
    const user = await this.userModel.findOne({
      email,
      codeConfirmation: code,
    });
    if (!user) {
      throw new BadRequestException(ErrorsEnum.INVALID_CODE);
    }
    user.active = true;
    user.codeConfirmation = undefined;
    user.rules = [];
    return removeRestrictKeys(await user.save(), keysSignup);
  }

  public async resendCode(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      email,
    });
    if (!user) {
      throw new BadRequestException(ErrorsEnum.USER_NOT_FOUND);
    }
    const emailService = new Email();
    const codeConfirmation = generateCodeConfirmation();
    user.codeConfirmation = codeConfirmation;
    user.active = false;
    user.rules = [];
    emailService.sendEmailConfirmation(email, String(codeConfirmation));
    return removeRestrictKeys(await user.save(), keysSignup);
  }

  public async updateUser(userData: UpdateUserDto, id: string): Promise<User> {
    let user = await this.userModel.findById(id);
    if (!user) {
      throw new BadRequestException(ErrorsEnum.USER_NOT_FOUND);
    }
    user = Object.assign(user, userData);
    return removeRestrictKeys(await user.save(), keysSignup);
  }
}
