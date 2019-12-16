interface ISession {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  permission: number;
}

interface ISessionStatus {
  loggedIn: boolean;
  user: ISession;
}

interface IUser {
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
  defaultLanguage?: string;
}

interface IUserLite {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  bannerImage: string;
}

interface IUserProblemResultStats {
  acceptedProblemIds: number[];
  attemptedProblemIds: number[];
}

interface IUserSolutionStats {
  accepted: number;
  submitted: number;
}

interface IDateCount {
  date: string;
  count: number;
}

type ISolutionCalendar = IDateCount[];

interface IRatingHistoryItem {
  contest: {
    contestId: number;
    title: number;
  };
  rank: number;
  rating: number;
  ratingChange: number;
  date: string;
}

type IRatingHistory = IRatingHistoryItem[];

interface IProblem {
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

interface IProblemLite {
  problemId: number;
  title: string;
}

interface ISolution {
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

interface IContest {
  contestId: number;
  title: string;
  type: number;
  category: number;
  intro: string;
  description?: string;
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

interface IContestProblemResultStats {
  [key: number]: {
    accepted: number;
    submitted: number;
  };
}

interface IContestUser {
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

interface IRanklistProblemResultStat {
  result: 'FB' | 'AC' | 'X' | '-' | '?';
  attempted: number;
  time: number;
}

interface IRanklistRow {
  rank: number;
  user: IUserLite;
  solved: number;
  time: number;
  stats: IRanklistProblemResultStat[];
  _self?: boolean;
}

type IRanklist = IRanklistRow[];

interface ITopic {
  topicId: number;
  user: IUserLite;
  problem: IProblemLite;
  title: string;
  content?: string;
  replyCount: number;
  createdAt: ITimestamp;
}

interface IReply {
  replyId: number;
  user?: IUserLite;
  topic?: {
    topicId: number;
    title: string;
  };
  content: string;
  createdAt: ITimestamp;
}

interface ITag {
  tagId: number;
  name: {
    en: string;
    zhHans: string;
    zhHant: string;
  };
  createdAt: ITimestamp;
}

interface IMessage {
  messageId: number;
  from: IUserLite;
  to: IUserLite;
  title: string;
  content: string;
  read?: boolean;
  anonymous: boolean;
  createdAt: ITimestamp;
}

interface IFavoriteBase {
  favoriteId: number;
  type: string;
  target: any;
  note: string;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

interface IFavoriteProblem extends IFavoriteBase {
  type: 'problem';
  target: {
    problemId: number;
    title: string;
  };
}

interface IFavoriteContest extends IFavoriteBase {
  type: 'contest';
  target: {
    contestId: number;
    title: string;
  };
}

type IFavorite = IFavoriteProblem | IFavoriteContest

interface ISet {
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

interface ISetPropsTypeStandard {
  sections: {
    title: string;
    problems: IProblem[];
  }[];
}

interface INoteBase {
  noteId: number;
  type: string;
  target: any;
  content: string;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

interface INoteProblem extends INoteBase {
  type: 'problem';
  target: {
    problemId: number;
    title: string;
    contest?: {
      contestId: number;
      title: string;
      problemIndex: number;
    };
  };
}

interface INoteContest extends INoteBase {
  type: 'contest';
  target: {
    contestId: number;
    title: string;
  };
}

interface INoteSolution extends INoteBase {
  type: 'solution';
  target: {
    solutionId: number;
    problem: IProblemLite;
    contest?: {
      contestId: number;
      title: string;
      problemIndex: number;
    };
    result: number;
  };
}

interface INoteUnknown extends INoteBase {
  type: '';
  target: {
    url: string;
    location: {
      pathname: string;
      search: string;
      query: any;
      hash: string;
    };
    [x: string]: any;
  };
}

type INote = INoteProblem | INoteContest | INoteSolution | INoteUnknown

interface INoteProblemReq {
  type: 'problem';
  target: {
    problemId: number;
    contestId?: number;
  };
}

interface INoteContestReq {
  type: 'contest';
  target: {
    contestId: number;
  };
}

interface INoteSolutionReq {
  type: 'solution';
  target: {
    solutionId: number;
  };
}

interface INoteUnknownReq {
  type: '';
  target: {
    url: string;
    location: {
      pathname: string;
      search: string;
      query: any;
      hash: string;
    };
  };
}

type INoteReq = INoteProblemReq | INoteContestReq | INoteSolutionReq | INoteUnknownReq

interface IGroupMember extends IUserLite {
  permission?: number;
  joinedAt?: ITimestamp;
}

interface IGroup {
  groupId: string;
  name: string;
  verified: boolean;
  members?: IGroupMember[];
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

type ISettingsTheme = 'light' | 'dark';

type ISettingsColor = 'default' | 'colorful' | 'colorblind-dp';

interface ISettings {
  theme: ISettingsTheme;
  color: ISettingsColor;
  improveAnimation: boolean;
}
