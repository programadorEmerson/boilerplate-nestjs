import { Document } from 'mongoose';

import { Rule } from 'src/users/models/rule.model';

export interface User extends Document {
  email: string;
  password: string;
  active: boolean;
  rules: Rule[];
  codeConfirmation: number;
  createdAt: string;
  updatedAt: string;
}
