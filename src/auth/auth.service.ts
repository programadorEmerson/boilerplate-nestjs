import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Request } from 'express';

import { Model } from 'mongoose';

import { sign, verify } from 'jsonwebtoken';

import { JwtPayload } from 'src/auth/models/jwt-payload';

import { ConstantsEnum } from 'src/enums/constants';
import { ErrorsEnum } from 'src/enums/errors';

import { User } from 'src/users/models/users.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(ConstantsEnum.USER) private readonly userModel: Model<User>,
  ) {}

  public async createAccessToken(userId: string): Promise<string> {
    const payload = { userId };
    return sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
  }

  public async validateUser(jwtPayload: JwtPayload): Promise<User> {
    const user = await this.userModel.findOne({ _id: jwtPayload.userId });

    if (!user) {
      throw new UnauthorizedException(ErrorsEnum.USER_NOT_FOUND);
    }
    return user;
  }

  private jwtExtractor = (req: Request): string => {
    let token = null;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException(ErrorsEnum.TOKEN_NOT_FOUND);
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      throw new UnauthorizedException(ErrorsEnum.TOKEN_INVALID);
    }

    const [scheme, credentials] = parts;

    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
    const idExtracted = verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log('idExtracted', idExtracted.userId);
    req.query[ConstantsEnum.Requester_ID] = idExtracted.userId;
    return token;
  };

  public returnJwtExtractor(): (request: Request) => string {
    return this.jwtExtractor;
  }

  public async getAuthenticatedUser(req: Request): Promise<User> {
    const token = this.jwtExtractor(req);
    const payload = verify(token, process.env.JWT_SECRET) as JwtPayload;
    return await this.validateUser(payload);
  }
}
