import { AccessLevel } from '../provider/types';

export const getAccessLevel = (numericAccessLevel: number) => {
  switch (numericAccessLevel) {
    case 50:
      return AccessLevel.OWNER;
    case 40:
      return AccessLevel.MAINTAINER;
    case 30:
      return AccessLevel.DEVELOPER;
    case 20:
      return AccessLevel.REPORTER;
    case 10:
      return AccessLevel.GUEST;
    case 5:
      return AccessLevel.MINIMAL_ACCESS;
    case 0:
    default:
      return AccessLevel.NO_ACCESS;
  }
};
