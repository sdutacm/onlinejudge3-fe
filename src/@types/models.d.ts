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
  email?: string;
  site?: string;
  settings?: any;
  verified?: boolean;
  coin?: number;
}

declare interface IUserProblemResultStats {
  acceptedProblemIds: number[];
  attemptedProblemIds: number[];
}

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
  accepted?: number;
  submitted?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

declare interface ISolution {
  solutionId: number;
  user: {
    userId: number;
    username: string;
    nickname: string;
    avatar: string;
    bannerImage: string;
  };
  problem: {
    problemId: number;
    title: string;
    timeLimit: number;
  };
  contest?: {
    contestId: number;
    title: string;
  };
  result: number;
  time: number;
  memory: number;
  language: string;
  codeLength: number;
  shared: boolean;
  createdAt: Timestamp;
  code?: string;
}

declare interface IDateCount {
  date: string;
  count: number;
}

declare type ISolutionCalendar = IDateCount[];

declare interface IContest {
  contestId: number;
  title: string;
  type: number;
  category: number;
  password?: string;
  startAt: number;
  endAt: number;
  frozenLength: number;
  registerStartEndAt?: number;
  registerEndAt?: number;
  team?: boolean;
  hidden?: boolean;
  ended: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

declare interface IRanklistProblemResultStat {
  result: 'FB' | 'AC' | 'X' | '-' | '?';
  attempted: number;
  time: number;
}

declare interface IRanklist {
  rank: number;
  user: {
    userId: number;
    username: string;
    nickname: string;
    avatar: string;
    bannerImage: string;
  };
  solved: number;
  time: number;
  stats: IRanklistProblemResultStat[];
}

declare interface ITopic {
  topicId: number;
  user: {
    userId: number;
    username: string;
    nickname: string;
    avatar: string;
    bannerImage: string;
  };
  problem: {
    problemId: number;
    title: string;
  };
  title: string;
  content?: string;
  replyCount: number;
  createdAt: Timestamp;
}

declare interface IReply {
  replyId: number;
  user?: {
    userId: number;
    username: string;
    nickname: string;
    avatar: string;
    bannerImage: string;
  };
  topic?: {
    topicId: number;
    title: string;
  };
  content: string;
  createdAt: Timestamp;
}

declare interface ITag {
  tagId: number;
  name: {
    en: string;
    zhHans: string;
    zhHant: string;
  };
  createdAt: Timestamp;
}
