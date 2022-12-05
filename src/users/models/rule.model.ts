import { IsString } from 'class-validator';

import { FeatureCodeEnum } from 'src/enums/feature.code';
import { TypeCodeEnum } from 'src/enums/type.code';

export class Rule {
  @IsString()
  action: TypeCodeEnum;

  @IsString()
  subject: FeatureCodeEnum;
}
