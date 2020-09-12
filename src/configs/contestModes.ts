export enum ContestModes {
  None = 0,
  Rating = 1,
}

export const contestModesMap = {
  [ContestModes.None]: {
    name: 'Normal',
  },
  [ContestModes.Rating]: {
    name: 'Rating',
  },
};

const contestModes = [
  {
    id: ContestModes.None,
    name: 'Normal',
  },
  {
    id: ContestModes.Rating,
    name: 'Rating',
  },
];

export default contestModes;
