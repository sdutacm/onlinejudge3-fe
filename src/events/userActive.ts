import mitt from 'mitt';

export const userActiveEmitter = mitt();

export enum UserActiveEvents {
  UserHasBeenActive = 'userHasBeenActive',
}
