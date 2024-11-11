import mitt from 'mitt';

export enum ReduxEvents {
  Dispatch = 'dispatch',
}

export interface IReduxEvenData {
  [ReduxEvents.Dispatch]: {
    type: string;
    payload?: any;
  };
}

// @ts-ignore
export const reduxEmitter = mitt<IReduxEvenData>();
