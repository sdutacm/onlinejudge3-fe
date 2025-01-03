interface ISession {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  permission: number;
  permissions: string[];
  type: number;
}

interface ISessionStatus {
  loggedIn: boolean;
  user: ISession;
}

interface ISessionListItem {
  sessionId: string;
  isCurrent: boolean;
  loginUa: string;
  loginIp: string;
  loginAt: string; // iso string
  lastAccessIp: string;
  lastAccessAt: string; // iso string
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
  type?: number;
  status?: number;
  coin?: number;
  solutionCalendar?: ISolutionCalendar;
  defaultLanguage?: string;
  groups?: IGroup[];
  forbidden: number;
  permission?: number;
  lastIp?: string;
  lastTime?: string | null;
  createdAt?: string;
}

interface IUserLite {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  bannerImage: string;
  rating?: number;
  type?: number;
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
  contest?: {
    contestId: number;
    title: string;
  };
  competition?: {
    competitionId: number;
    title: string;
  };
  rank: number;
  rating: number;
  ratingChange: number;
  date: string;
}

type IRatingHistory = IRatingHistoryItem[];

interface IUserMember {
  userId: number;
  username: string;
  nickname: string;
  avatar: string | null;
  bannerImage: string;
  accepted: number;
  submitted: number;
  rating: number;
  verified: boolean;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface IUserSelfJoinedTeam {
  teamUserId: number;
  selfMemberStatus: number;
  selfJoinedAt: string;
  username: string;
  nickname: string;
  avatar: string | null;
  bannerImage: string;
  status: number;
  members: {
    userId: number;
    username: string;
    nickname: string;
    avatar: string | null;
    bannerImage: string;
    accepted: number;
    submitted: number;
    rating: number;
    verified: boolean;
    status: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

interface IProblem {
  problemId: number;
  title: string;
  description?: string;
  input?: string;
  output?: string;
  samples: {
    in: string;
    out: string;
  }[];
  hint?: string;
  source: string;
  authors: string[];
  tags?: ITag[];
  timeLimit?: number;
  memoryLimit?: number;
  difficulty: number;
  accepted?: number;
  submitted?: number;
  display: boolean;
  spj: boolean;
  spConfig: any;
  alias?: string /** only in competition */;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

interface ICompetitionProblem extends IProblem {
  balloonAlias: string;
  balloonColor: string;
  score: number | null;
  varScoreExpression: string;
  alias: string;
}

interface IProblemLite {
  problemId: number;
  title: string;
}

interface ISolutionJudgeInfoDetailCase {
  result: number;
  time: number;
  memory: number;
  compileInfo?: string;
  errMsg?: string;
  outMsg?: string;
}

interface ISolutionJudgeInfoDetail {
  cases: ISolutionJudgeInfoDetailCase[];
}

interface ISolutionJudgeInfo {
  lastCase: number;
  totalCase: number;
  detail: ISolutionJudgeInfoDetail | null;
  finishedAt: Date;
}

interface ISolution {
  solutionId: number;
  user: IUserLite;
  problem: {
    problemId: number;
    title?: string;
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
  judgeInfo?: ISolutionJudgeInfo;
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
  registerStartAt?: number;
  registerEndAt?: number;
  team?: boolean;
  hidden?: boolean;
  ended: boolean;
  mode: number;
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
  result: 'FB' | 'AC' | 'RJ' | '?' | null;
  tries: number;
  time: number;
  score?: number;
}

interface IRanklistRow {
  rank: number;
  user: IUserLite & {
    globalUserId?: number;
    oldRating?: number;
    newRating?: number;
  };
  score: number;
  time: number;
  stats: IRanklistProblemResultStat[];
  _self?: boolean;
}

type IRanklist = IRanklistRow[];

interface IContestRatingStatus {
  status: 0 | 1 | 2 | 3;
  progress: number;
  used: number;
  totalUsed: number;
}

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

interface IPost {
  postId: number;
  user?: IUserLite;
  title: string;
  content?: string;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
  display: boolean;
}

interface ITag {
  tagId: number;
  nameEn: string;
  nameZhHans: string;
  nameZhHant: string;
  createdAt: ITimestamp;
  hidden: boolean;
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

type IFavoriteType = 'problem' | 'contest' | 'set' | 'group';

interface IFavoriteBase {
  favoriteId: number;
  type: IFavoriteType;
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

interface IFavoriteSet extends IFavoriteBase {
  type: 'set';
  target: {
    setId: number;
    title: string;
  };
}

interface IFavoriteGroup extends IFavoriteBase {
  type: 'group';
  target: {
    groupId: number;
    title: string;
    name: IGroup['name'];
    verified: IGroup['verified'];
  };
}

type IFavorite = IFavoriteProblem | IFavoriteContest | IFavoriteSet | IFavoriteGroup;

interface ISet {
  setId: number;
  title: string;
  description: string;
  type: 'standard';
  props: any;
  hidden?: boolean;
  user: IUserLite;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

interface ISetPropsTypeStandard {
  sections: {
    title: string;
    description?: string;
    problems: IProblem[];
  }[];
}

interface ISetStandard extends ISet {
  props: ISetPropsTypeStandard;
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

type INote = INoteProblem | INoteContest | INoteSolution | INoteUnknown;

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

type INoteReq = INoteProblemReq | INoteContestReq | INoteSolutionReq | INoteUnknownReq;

interface IGroup {
  groupId: number;
  name: string;
  avatar: string;
  intro: string;
  verified: boolean;
  private: boolean;
  joinChannel: 0 | 1 | 2;
  membersCount: number;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
  deleted?: boolean;
}

interface IGroupMember {
  groupMemberId: number;
  permission?: 0 | 1 | 3;
  status?: 0 | 1;
  joinedAt?: ITimestamp;
  user: IUserLite;
}

interface IGroupLiteWithMembers {
  groupId: IGroup['groupId'];
  name: IGroup['name'];
  verified: IGroup['verified'];
  members: IGroupMember[];
}

interface IStatsUserACRankUserStatus {
  user: IUserLite;
  accepted: number;
}

interface IStatsUserACRank {
  count: number;
  rows: IStatsUserACRankUserStatus[];
  truncated: number;
  startAt: string;
  _updateEvery: number;
  _updatedAt: number;
}

interface IStatsUserAcceptedProblems {
  stats: Record<
    number,
    {
      accepted: number;
      problems: {
        pid: number;
        sid: number;
        at: number; // timestamp (s)
      }[];
      _updatedAt: number; // timestamp (ms)
    }
  >;
  truncated: number;
  _updateEvery: number;
  _updatedAt: number; // timestamp (ms)
}

interface IStatsUserSubmittedProblems {
  stats: Record<
    number,
    {
      accepted: number;
      submitted: number;
      problems: {
        pid: number;
        s: {
          sid: number;
          res: number;
          at: number; // timestamp (s)
        }[];
      }[];
      _updatedAt: number; // timestamp (ms)
    }
  >;
  truncated: number;
  _updateEvery: number;
  _updatedAt: number; // timestamp (ms)
}

interface IStatsUASP {
  stats: Record<
    number,
    {
      accepted: number;
      submitted?: number; // 仅指定包含 submitted 时
      problems: {
        pid: number;
        sid?: number; // 仅存在 AC 提交时
        at?: number; // timestamp (s)，仅存在 AC 提交时
        s?: {
          sid: number;
          res: number;
          at: number; // timestamp (s)
        }[]; // 仅指定包含 submitted 时
      }[];
      _updatedAt: number; // timestamp (ms)
    }
  >;
  truncated: number;
  _updateEvery: number;
  _updatedAt: number; // timestamp (ms)
}

interface ISetUserStats {
  solved: number;
  problemsStatsMap: Map<
    number,
    {
      accepted: boolean;
      attempted?: number;
    }
  >;
}

interface ISetStatsRanklistRow {
  rank: number;
  user: IUserLite;
  stats: ISetUserStats;
}

type ISetStatsRanklist = ISetStatsRanklistRow[];

interface ISetStatsGroupRanklist {
  groupId: IGroup['groupId'];
  name: IGroup['name'];
  verified: IGroup['verified'];
  ranklist: ISetStatsRanklist;
}

type ISettingsTheme = 'auto' | 'light' | 'dark';

type ISettingsColor = 'default' | 'colorful' | 'colorblind-dp';

interface ISettings {
  theme: ISettingsTheme;
  themeLocked?: boolean;
  color: ISettingsColor;
  improveAnimation: boolean;
  proMode: boolean;
  useAbsoluteTime: boolean;
}

type INoticeId = string;

interface INotices {
  read: Record<INoticeId, boolean>;
}

interface IJudgeStatus {
  solutionId: number;
  state: number; // 0: running, 1: finished
  result: number;
  current: number;
  total: number;
}

interface IJudgerLanguageConfigItem {
  language: string;
  compile: string;
  run: string;
  version: string;
}

interface IFieldSeatingArrangement {
  seatMap: {
    row: number;
    col: number;
    arrangement: (number | null)[][];
  };
  seats: {
    seatNo: number;
    boundIp?: string;
    disabled?: boolean;
  }[];
}

interface IField {
  fieldId: number;
  name: string;
  shortName: string;
  seatingArrangement: IFieldSeatingArrangement | null;
  createdAt: ITimestamp;
  updatedAt: ITimestamp;
}

interface ICompetitionSessionStatus {
  loggedIn: boolean;
  user: {
    userId: number;
    nickname: string;
    subname: string;
    role: number;
  };
}

interface ICompetitionProblemResultStats {
  [key: number]: {
    accepted: number;
    submitted: number;
    selfTries: number;
    selfAccepted: boolean;
    selfAcceptedTime: Date | null;
  };
}

interface ICompetitionRatingStatus {
  status: 0 | 1 | 2 | 3;
  progress: number;
  used: number;
  totalUsed: number;
}
