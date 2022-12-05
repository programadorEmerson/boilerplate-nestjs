import * as bcrypt from 'bcrypt';

import mongoose from 'mongoose';

import { ConstantsEnum } from 'src/enums/constants';

export const UserSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
  active: { type: Boolean },
  rules: { type: Array },
  codeConfirmation: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String },
});

UserSchema.pre(ConstantsEnum.SAVE, async function (next) {
  try {
    this.updatedAt = new Date().toISOString();
    if (!this.isModified(ConstantsEnum.PASSWORD)) {
      return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    return next(error);
  }
});
