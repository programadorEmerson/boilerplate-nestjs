import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { Request } from 'express';

import { ConstantsEnum } from 'src/enums/constants';

import { SigninUserDto } from 'src/users/dto/signin.user.dto/signin.user.dto';
import { SignupUserDto } from 'src/users/dto/signup.user.dto/signup.user.dto';
import { UpdateUserDto } from 'src/users/dto/update.user.dto/update.user.dto';
import { User } from 'src/users/models/users.model';
import { UsersService } from 'src/users/users.service';

@ApiTags('users')
@Controller(ConstantsEnum.USERS)
export class UsersController {
  constructor(private userServices: UsersService) {}

  @Post(ConstantsEnum.SIGNUP)
  @HttpCode(HttpStatus.CREATED)
  public async signUp(@Body() signupDto: SignupUserDto) {
    return await this.userServices.signUp(signupDto);
  }

  @Post(ConstantsEnum.SIGNIN)
  @HttpCode(HttpStatus.OK)
  public async signIn(@Body() signinDto: SigninUserDto) {
    return await this.userServices.signIn(signinDto);
  }

  @Get(ConstantsEnum.GET_ALL)
  @UseGuards(AuthGuard(ConstantsEnum.JWT))
  @HttpCode(HttpStatus.OK)
  public async findAllUsers(@Req() request: Request): Promise<User[]> {
    const { requesterId } = request.query;
    return await this.userServices.findAllUsers(String(requesterId));
  }

  @Delete(`${ConstantsEnum.DELETE}/:${ConstantsEnum.ID}`)
  @UseGuards(AuthGuard(ConstantsEnum.JWT))
  @HttpCode(HttpStatus.OK)
  public async deleteUser(@Param(ConstantsEnum.ID) id: string): Promise<User> {
    return await this.userServices.deleteUserById(id);
  }

  @Patch(`${ConstantsEnum.UPDATE}`)
  @HttpCode(HttpStatus.OK)
  public async confirmCode(
    @Query(ConstantsEnum.EMAIL) email: string,
    @Query(ConstantsEnum.CODE) code: string,
  ): Promise<User> {
    return await this.userServices.confirmCode(email, code);
  }

  @Patch(`${ConstantsEnum.RESEND_CODE}`)
  @HttpCode(HttpStatus.OK)
  public async resendCode(@Query(ConstantsEnum.EMAIL) email: string) {
    return await this.userServices.resendCode(email);
  }

  @Patch(`${ConstantsEnum.UPDATE_USER}/:${ConstantsEnum.ID}`)
  @UseGuards(AuthGuard(ConstantsEnum.JWT))
  @HttpCode(HttpStatus.OK)
  public async updateUser(
    @Body() userData: UpdateUserDto,
    @Param(ConstantsEnum.ID) id: string,
  ): Promise<User> {
    return await this.userServices.updateUser(userData, id);
  }
}
