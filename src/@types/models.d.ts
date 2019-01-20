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
  read: boolean;
  createdAt: ITimestamp,
}

declare interface IFavorite {
  favoriteId: number;
  type: 'problem' | 'contest';
  target: any;
  note: string;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

declare type ITheme = 'light' | 'dark';

declare interface ISettings {
  theme: ITheme;
}
