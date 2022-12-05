import { Injectable } from '@nestjs/common';

import { ConstantsEnum } from 'src/enums/constants';

@Injectable()
export class AppService {
  getHello(): string {
    return ConstantsEnum.SERVER_IS_RUNNING;
  }
}
