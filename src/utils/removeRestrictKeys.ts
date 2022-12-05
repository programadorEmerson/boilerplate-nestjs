import { ConstantsEnum } from 'src/enums/constants';

export const removeRestrictKeys = <T>(
  data: T,
  keysToRemove: ConstantsEnum[],
): T => {
  keysToRemove.forEach((key) => {
    data[key] = undefined;
  });
  return data;
};
