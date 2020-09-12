export enum ContestCategories {
  Contest = 0,
  Experiment = 1,
  Test = 2,
}

export const contestCategoriesMap = {
  [ContestCategories.Contest]: {
    name: 'Contest',
  },
  [ContestCategories.Experiment]: {
    name: 'Experiment',
  },
  [ContestCategories.Test]: {
    name: 'Test',
  },
};

const contestCategories = [
  {
    id: ContestCategories.Contest,
    name: 'Contest',
  },
  {
    id: ContestCategories.Test,
    name: 'Test',
  },
  {
    id: ContestCategories.Experiment,
    name: 'Experiment',
  },
];

export default contestCategories;
