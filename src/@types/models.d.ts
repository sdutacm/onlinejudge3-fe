declare interface Session {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  permission: number;
}

declare interface SessionStatus {
  loggedIn: boolean;
  user: Session;
}

declare interface User {
  userId: number;
  username: string;
  nickname: string;
  school?: string;
  college?: string;
  major?: string;
  class?: string;
  avatar: string;
  accepted?: number;
  submitted?: number;
  email?: string;
  site?: string;
}

declare interface Problem {
  problemId: number;
  title: string;
  description?: string,
  input?: string,
  output?: string,
  sampleInput?: string,
  sampleOutput?: string,
  hint?: string,
  source: string;
  author: string;
  tags: number[];
  timeLimit?: number,
  memoryLimit?: number,
  createdAt: number;
  updatedAt: number;
  accepted: number;
  submitted: number;
  solved?: boolean;
  attempted?: boolean,
}

declare interface Solution {
  solutionId: number;
  user: {
    userId: number;
    username: string;
    nickname: string;
    avatar: string;
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
  result: number,
  time: number;
  memory: number;
  language: string;
  codeLength: number;
  shared: boolean;
  createdAt: number;
  code?: string;
}
