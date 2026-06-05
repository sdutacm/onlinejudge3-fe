export const anonymousSession = null;

export const normalUser = {
  userId: 101,
  username: 'alice',
  nickname: 'Alice AC',
  avatar: '',
  bannerImage: '',
  permission: 0,
  permissions: [],
  type: 0,
  forbidden: 0,
  accepted: 1,
  submitted: 1,
  rating: 1500,
  verified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const adminUser = {
  ...normalUser,
  userId: 1,
  username: 'root',
  nickname: 'Root Admin',
  permission: 3,
  permissions: [
    'AdminAccess',
    'ContestAccess',
    'ReadContest',
    'WriteContest',
    'ReadProblem',
    'WriteProblem',
    'ReadTag',
    'WriteProblemTag',
    'ReadUser',
    'WriteUser',
    'ResetUserPassword',
    'ReadSolution',
  ],
};

export const tag = {
  tagId: 7,
  nameEn: 'implementation',
  nameZhHans: '实现',
  nameZhHant: '實作',
  createdAt: Date.UTC(2026, 0, 1),
  hidden: false,
};

export const problem = {
  problemId: 1000,
  title: 'A + B Problem',
  description: '<p>Calculate the sum of two integers.</p>',
  input: '<p>Two integers a and b.</p>',
  output: '<p>Their sum.</p>',
  samples: [
    {
      in: '1 2',
      out: '3',
    },
  ],
  hint: '<p>Use standard input and output.</p>',
  source: 'Smoke Fixture',
  authors: ['tester'],
  tags: [tag],
  timeLimit: 1000,
  memoryLimit: 65536,
  difficulty: 1,
  accepted: 12,
  submitted: 20,
  display: true,
  spj: false,
  spConfig: {},
  createdAt: Date.UTC(2026, 0, 1),
  updatedAt: Date.UTC(2026, 0, 1),
};

export const solution = {
  solutionId: 2000,
  user: normalUser,
  problem: {
    problemId: problem.problemId,
    title: problem.title,
  },
  result: 1,
  time: 15,
  memory: 512,
  language: 'C++',
  codeLength: 56,
  shared: true,
  createdAt: Date.UTC(2026, 0, 2),
  code: '#include <iostream>\nint main(){int a,b;std::cin>>a>>b;std::cout<<a+b;}',
  compileInfo: '',
  judgeInfo: {
    lastCase: 1,
    totalCase: 1,
    detail: {
      cases: [
        {
          result: 1,
          time: 15,
          memory: 512,
        },
      ],
    },
    finishedAt: '2026-01-02T00:00:00.000Z',
  },
};

export const contest = {
  contestId: 1,
  title: 'Smoke Contest',
  type: 0,
  category: 0,
  intro: 'A deterministic contest fixture.',
  description: '<p>A deterministic contest fixture.</p>',
  startAt: Date.UTC(2026, 0, 1),
  endAt: Date.UTC(2027, 0, 1),
  frozenLength: 0,
  registerStartAt: Date.UTC(2025, 11, 1),
  registerEndAt: Date.UTC(2025, 11, 31),
  team: false,
  hidden: false,
  ended: false,
  mode: 0,
  createdAt: Date.UTC(2026, 0, 1),
  updatedAt: Date.UTC(2026, 0, 1),
};

export const contestSession = {
  loggedIn: true,
  user: {
    contestUserId: 11,
    userId: normalUser.userId,
    username: normalUser.username,
    nickname: normalUser.nickname,
    avatar: '',
    status: 1,
    unofficial: false,
    members: [],
    createdAt: Date.UTC(2026, 0, 1),
    updatedAt: Date.UTC(2026, 0, 1),
  },
};

export const competition = {
  ...contest,
  competitionId: 1,
  title: 'Smoke Competition',
  type: 0,
  mode: 0,
  spConfig: {},
};

export const competitionSession = {
  loggedIn: true,
  user: {
    userId: normalUser.userId,
    nickname: normalUser.nickname,
    subname: normalUser.username,
    role: 2,
  },
};

export const competitionSettings = {
  frozen: false,
  showPro: true,
  showTotal: true,
  showRating: false,
};

export const competitionProblemResultStats = {
  [problem.problemId]: {
    accepted: 1,
    submitted: 1,
    selfTries: 1,
    selfAccepted: true,
    selfAcceptedTime: Date.UTC(2026, 0, 1, 0, 15),
  },
};

export const ranklistRows = [
  {
    rank: 1,
    user: normalUser,
    score: 1,
    time: 15,
    stats: [
      {
        result: 'AC',
        tries: 1,
        time: 15,
      },
    ],
  },
];

export const languageConfig = [
  {
    language: 'C++',
    compile: 'g++ main.cpp',
    run: './a.out',
    version: 'GCC 11',
  },
  {
    language: 'Python',
    compile: '',
    run: 'python3 main.py',
    version: 'Python 3.10',
  },
];

export const list = (rows: any[], page = 1, limit = 20) => ({
  page,
  count: rows.length,
  limit,
  rows,
});

export const fullList = (rows: any[]) => ({
  count: rows.length,
  rows,
});
