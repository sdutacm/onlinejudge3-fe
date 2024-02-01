import mitt from 'mitt';

export enum SolutionEvents {
  Accepted = 'accepted',
}

export interface ISolutionEventData {
  [SolutionEvents.Accepted]: {
    problemId: number;
    problem: IProblem;
    contestId?: number;
    competitionId?: number;
    problemIndex?: number;
    problemAlias?: string;
  };
}

// @ts-ignore
export const solutionEmitter = mitt<ISolutionEventData>();
