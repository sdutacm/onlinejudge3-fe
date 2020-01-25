export enum ContestRatingStatus {
  PD = 0,
  CAL = 1,
  DONE = 2,
  ERR = 3,
}

export type ContestRatingStatusValue = 0 | 1 | 2 | 3;

export const contestRatingStatusMap = {
  [ContestRatingStatus.PD]: {
    name: 'Pending Rating Calculation',
  },
  [ContestRatingStatus.CAL]: {
    name: 'Calculating Rating',
  },
  [ContestRatingStatus.DONE]: {
    name: 'Rating Calculation Completed',
  },
  [ContestRatingStatus.ERR]: {
    name: 'Rating Calculation Error',
  },
};

const contestRatingStatus = [
  {
    id: ContestRatingStatus.PD,
    name: 'Pending Rating Calculation',
  },
  {
    id: ContestRatingStatus.CAL,
    name: 'Calculating Rating',
  },
  {
    id: ContestRatingStatus.DONE,
    name: 'Rating Calculation Completed',
  },
  {
    id: ContestRatingStatus.ERR,
    name: 'Rating Calculation Error',
  },
];

export default contestRatingStatus;
