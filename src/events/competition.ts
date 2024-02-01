import mitt from 'mitt';
import {
  ICompetition,
  ICompetitionSpConfigGenshinExplorationSection,
} from '@/common/interfaces/competition';

export enum CompetitionEvents {
  SpGenshinSectionUnlocked = 'spGenshinSectionUnlocked',
}

export interface ICompetitionEvenData {
  [CompetitionEvents.SpGenshinSectionUnlocked]: {
    competitionId: number;
    section: ICompetitionSpConfigGenshinExplorationSection;
    competition: ICompetition;
  };
}

// @ts-ignore
export const competitionEmitter = mitt<ICompetitionEvenData>();
