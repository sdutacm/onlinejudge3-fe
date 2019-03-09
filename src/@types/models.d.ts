declare interface ISession {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  permission: number;
}

declare interface ISessionStatus {
  loggedIn: boolean;
  user: ISession;
}

declare interface IUser {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  bannerImage: string;
  school?: string;
  college?: string;
  major?: string;
  class?: string;
  accepted?: number;
  submitted?: number;
  rating?: number;
  ratingHistory?: IRatingHistory;
  email?: string;
  site?: string;
  settings?: any;
  verified?: boolean;
  coin?: number;
  solutionCalendar?: ISolutionCalendar;
}

declare interface IUserLite {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  bannerImage: string;
}

declare interface IUserProblemResultStats {
  acceptedProblemIds: number[];
  attemptedProblemIds: number[];
}

declare interface IUserSolutionStats {
  accepted: number;
  submitted: number;
}

declare interface IDateCount {
  date: string;
  count: number;
}

declare type ISolutionCalendar = IDateCount[];

declare interface IRatingHistoryItem {
  contest: {
    contestId: number;
    title: number;
  };
  rank: number;
  rating: number;
  ratingChange: number;
  date: string;
}

declare type IRatingHistory = IRatingHistoryItem[];

declare interface IProblem {
  problemId: number;
  title: string;
  description?: string;
  input?: string;
  output?: string;
  sampleInput?: string;
  sampleOutput?: string;
  hint?: string;
  source: string;
  author: string;
  tags?: ITag[];
  timeLimit?: number;
  memoryLimit?: number;
  difficulty: number;
  accepted?: number;
  submitted?: number;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

declare interface ISolution {
  solutionId: number;
  user: IUserLite;
  problem: {
    problemId: number;
    title: string;
    timeLimit: number;
  };
  contest?: {
    contestId: number;
    title: string;
    type: number;
  };
  result: number;
  time: number;
  memory: number;
  language: string;
  codeLength: number;
  shared: boolean;
  createdAt: ITimestamp;
  code?: string;
  compileInfo?: string;
}

declare interface IContest {
  contestId: number;
  title: string;
  type: number;
  category: number;
  intro: string;
  description?: string,
  password?: string;
  startAt: number;
  endAt: number;
  frozenLength: number;
  registerStartEndAt?: number;
  registerEndAt?: number;
  team?: boolean;
  hidden?: boolean;
  ended: boolean;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

declare interface IContestProblemResultStats {
  [key: number]: {
    accepted: number;
    submitted: number;
  };
}

declare interface IContestUser {
  contestUserId: number;
  username: string;
  nickname: string;
  subname?: string;
  avatar: string;
  password?: string;
  sitNo?: string;
  status: number;
  unofficial: boolean;
  members: {
    schoolNo?: string;
    name?: string;
    school?: string;
    college?: string;
    major?: string;
    class?: string;
    tel?: string;
    email?: string;
    clothing?: string;
  }[];
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

declare interface IRanklistProblemResultStat {
  result: 'FB' | 'AC' | 'X' | '-' | '?';
  attempted: number;
  time: number;
}

declare interface IRanklistRow {
  rank: number;
  user: IUserLite;
  solved: number;
  time: number;
  stats: IRanklistProblemResultStat[];
  _self?: boolean;
}

declare type IRanklist = IRanklistRow[];

declare interface ITopic {
  topicId: number;
  user: IUserLite;
  problem: {
    problemId: number;
    title: string;
  };
  title: string;
  content?: string;
  replyCount: number;
  createdAt: ITimestamp;
}

declare interface IReply {
  replyId: number;
  user?: IUserLite;
  topic?: {
    topicId: number;
    title: string;
  };
  content: string;
  createdAt: ITimestamp;
}

declare interface ITag {
  tagId: number;
  name: {
    en: string;
    zhHans: string;
    zhHant: string;
  };
  createdAt: ITimestamp;
}

declare interface IMessage {
  messageId: number;
  from: IUserLite;
  to: IUserLite;
  title: string;
  content: string;
  read?: boolean;
  anonymous: boolean;
  createdAt: ITimestamp,
}

declare interface IFavoriteBase {
  favoriteId: number;
  type: string;
  target: any;
  note: string;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

declare interface IFavoriteProblem extends IFavoriteBase {
  type: 'problem';
  target: {
    problemId: number;
    title: string;
  };
}

declare interface IFavoriteContest extends IFavoriteBase {
  type: 'contest';
  target: {
    contestId: number;
    title: string;
  };
}

declare type IFavorite = IFavoriteProblem | IFavoriteContest

declare interface ISet {
  setId: number;
  title: string;
  description: string;
  type: 'standard';
  props: any;
  startAt: ITimestamp;
  endAt: ITimestamp;
  hidden?: boolean;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

declare interface INoteBase {
  noteId: number;
  type: string;
  target: any;
  content: string;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

declare interface INoteProblem extends INoteBase {
  type: 'problem';
  target: {
    problemId: number;
    title: string;
    contest?: {
      contestId: number;
      title: string;
    };
  };
}

declare interface INoteContest extends INoteBase {
  type: 'contest';
  target: {
    contestId: number;
    title: string;
  };
}

declare interface INoteSolution extends INoteBase {
  type: 'solution';
  target: {
    solutionId: number;
    problem: {
      problemId: number;
      title: string;
    };
    contest?: {
      contestId: number;
      title: string;
    };
    result: number;
  };
}

declare interface INoteUnknown extends INoteBase {
  type: '';
  target: {
    url: string;
    location: {
      pathname: string,
      search: string,
      query: any,
      hash: string,
    };
    [x: string]: any,
  };
}

declare type INote = INoteProblem | INoteContest | INoteSolution | INoteUnknown

declare interface INoteProblemReq {
  type: 'problem';
  target: {
    problemId: number;
    contestId?: number;
  };
}

declare interface INoteContestReq {
  type: 'contest';
  target: {
    contestId: number;
  };
}

declare interface INoteSolutionReq {
  type: 'solution';
  target: {
    solutionId: number;
  };
}

declare interface INoteUnknownReq {
  type: '';
  target: {
    url: string;
    location: {
      pathname: string,
      search: string,
      query: any,
      hash: string,
    };
  };
}

declare type INoteReq = INoteProblemReq | INoteContestReq | INoteSolutionReq | INoteUnknownReq

declare interface ISetPropsTypeStandard {
  sections: {
    title: string;
    problems: IProblem[];
  }[];
}

declare type ISettingsTheme = 'light' | 'dark';

declare type ISettingsColor = 'default' | 'colorful' | 'colorblind-dp';

declare interface ISettings {
  theme: ISettingsTheme;
  color: ISettingsColor;
  improveAnimation: boolean;
}
