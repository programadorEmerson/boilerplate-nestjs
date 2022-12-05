import { PartialType } from '@nestjs/swagger';

import { SignupUserDto } from 'src/users/dto/signup.user.dto/signup.user.dto';

export class UpdateUserDto extends PartialType(SignupUserDto) {}
