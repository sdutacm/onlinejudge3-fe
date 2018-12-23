export enum ContestTypes {
  Public = 3,
  Private = 1,
  Register = 2,
}

export const contestTypesMap = {
  [ContestTypes.Public]: {
    name: 'Public',
  },
  [ContestTypes.Private]: {
    name: 'Private',
  },
  [ContestTypes.Register]: {
    name: 'Register',
  },
};

const contestTypes = [
  {
    id: ContestTypes.Public,
    name: 'Public',
  },
  {
    id: ContestTypes.Private,
    name: 'Private',
  },
  {
    id: ContestTypes.Register,
    name: 'Register',
  },
];

export default contestTypes;
