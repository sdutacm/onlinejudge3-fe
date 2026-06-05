import { Page, Route } from '@playwright/test';
import {
  adminUser,
  anonymousSession,
  competition,
  competitionProblemResultStats,
  competitionSession,
  competitionSettings,
  contest,
  contestSession,
  fullList,
  languageConfig,
  list,
  normalUser,
  problem,
  ranklistRows,
  solution,
  tag,
} from './fixtures';

type SessionKind = 'anonymous' | 'user' | 'admin';

interface MockApiOptions {
  problemListSize?: number;
  session?: SessionKind;
  theme?: 'light' | 'dark';
}

export interface SmokeMonitor {
  apiCalls: string[];
  consoleErrors: string[];
  resourceFailures: string[];
  scriptFailures: string[];
  scriptUrls: string[];
  pageErrors: string[];
}

function ok(data: any = null) {
  return {
    success: true,
    data,
  };
}

function error(message: string) {
  return {
    success: false,
    message,
  };
}

function sessionFor(kind: SessionKind) {
  if (kind === 'admin') {
    return adminUser;
  }
  if (kind === 'user') {
    return normalUser;
  }
  return anonymousSession;
}

function problemListRows(size: number) {
  return Array.from({ length: size }, (_, index) => ({
    ...problem,
    problemId: problem.problemId + index,
    title: index ? `A+B for Input-Output Practice (${index})` : problem.title,
    accepted: Math.max(0, problem.accepted - index),
    submitted: Math.max(1, problem.submitted + index),
  }));
}

function json(route: Route, data: any, status = 200) {
  return route.fulfill({
    status,
    headers: {
      'content-type': 'application/json',
      date: new Date().toUTCString(),
    },
    body: JSON.stringify(data),
  });
}

function getEndpoint(url: string) {
  const parsed = new URL(url);
  return parsed.pathname.replace(/^\/onlinejudge3(?:_cs)?\/api/, '') || '/';
}

function isScriptRequest(url: string) {
  return /\.js(?:\?|$)/.test(new URL(url).pathname);
}

function isUnknownWriteEndpoint(endpoint: string) {
  return /^\/(add|audit|batch|cancel|clear|confirm|create|delete|do|end|login|logout|modify|random|rejudge|request|send|set|submit|update)/.test(
    endpoint,
  );
}

function isExpectedSocketMockError(text: string) {
  return (
    text.includes('WebSocket connection to') &&
    text.includes('/socket.io/') &&
    text.includes('Unexpected response code: 204')
  );
}

function responseFor(endpoint: string, options: Required<MockApiOptions>) {
  switch (endpoint) {
    case '/getSession':
      return ok(sessionFor(options.session));
    case '/login':
      return ok(normalUser);
    case '/logout':
      return ok(null);
    case '/getLanguageConfig':
      return ok(languageConfig);
    case '/getMessageList':
      return ok(list([]));
    case '/getActiveUserCount':
      return ok({ count: 3 });
    case '/getUserACRank':
      return ok({
        count: 1,
        rows: [
          {
            user: normalUser,
            accepted: 1,
          },
        ],
        truncated: 0,
        startAt: Date.UTC(2026, 0, 1),
      });
    case '/getUserProblemResultStats':
      return ok({
        acceptedProblemIds: [problem.problemId],
        attemptedProblemIds: [problem.problemId],
      });
    case '/getFavoriteList':
    case '/getNoteList':
      return ok(fullList([]));
    case '/getSelfAchievedAchievements':
      return ok(fullList([]));
    case '/getSelfOfficialMembers':
    case '/getSelfJoinedTeams':
      return ok({ count: 0, rows: [] });
    case '/getAchievementRate':
      return ok({ count: 0, rows: [] });
    case '/requestAchievementPush':
      return ok(null);
    case '/getProblemList':
      return ok(list(problemListRows(options.problemListSize)));
    case '/getProblemDetail':
      return ok(problem);
    case '/getTagFullList':
      return ok(fullList([tag]));
    case '/getSolutionList':
    case '/batchGetSolutionDetail':
      return ok({
        lt: null,
        gt: solution.solutionId,
        limit: 20,
        rows: [solution],
      });
    case '/getSolutionDetail':
      return ok(solution);
    case '/submitSolution':
      return ok({ solutionId: solution.solutionId });
    case '/getContestList':
      return ok(list([contest]));
    case '/getContestSession':
      return ok(contestSession.user);
    case '/getContestDetail':
      return ok(contest);
    case '/getContestProblems':
      return ok(fullList([{ ...problem, alias: 'A' }]));
    case '/getContestProblemSolutionStats':
      return ok({
        [problem.problemId]: {
          accepted: 1,
          submitted: 1,
        },
      });
    case '/getContestRanklist':
      return ok(fullList(ranklistRows));
    case '/getContestRatingStatus':
      return ok({
        status: 3,
        progress: 100,
        used: 1,
        totalUsed: 1,
      });
    case '/getCompetitionList':
      return ok(list([competition]));
    case '/getCompetitionSession':
    case '/getSelfCompetitionUserDetail':
      return ok(competitionSession.user);
    case '/getCompetitionDetail':
      return ok(competition);
    case '/getCompetitionSettings':
      return ok(competitionSettings);
    case '/getCompetitionProblems':
      return ok(fullList([{ ...problem, alias: 'A' }]));
    case '/getCompetitionProblemSolutionStats':
      return ok(competitionProblemResultStats);
    case '/getCompetitionNotifications':
    case '/getCompetitionQuestions':
    case '/getSelfCompetitionQuestions':
      return ok(fullList([]));
    case '/getCompetitionRanklist':
      return ok(fullList(ranklistRows));
    case '/getCompetitionRatingStatus':
      return ok({
        status: 3,
        progress: 100,
        used: 1,
        totalUsed: 1,
      });
    case '/getCompetitionSpGenshinExplorationUnlockRecords':
      return ok([]);
    case '/getUserList':
      return ok(list([normalUser, adminUser]));
    case '/getUserDetail':
      return ok(normalUser);
    case '/getAllUserPermissionsMap':
      return ok(fullList([]));
    case '/getPostList':
    case '/getGroupList':
    case '/getFieldList':
      return ok(list([]));
    default:
      if (isUnknownWriteEndpoint(endpoint)) {
        return ok(null);
      }
      return {
        status: 500,
        data: error(`Unhandled mock endpoint: ${endpoint}`),
      };
  }
}

export async function setupMockApi(
  page: Page,
  options: MockApiOptions = {},
): Promise<SmokeMonitor> {
  const resolved = {
    problemListSize: options.problemListSize || 1,
    session: options.session || 'anonymous',
    theme: options.theme || 'light',
  } as Required<MockApiOptions>;
  const monitor: SmokeMonitor = {
    apiCalls: [],
    consoleErrors: [],
    resourceFailures: [],
    scriptFailures: [],
    scriptUrls: [],
    pageErrors: [],
  };

  page.on('response', (response) => {
    const url = response.url();
    const status = response.status();
    if (!isScriptRequest(url)) {
      if (status >= 400 && !url.includes('/api/')) {
        monitor.resourceFailures.push(`${status} ${url}`);
      }
      return;
    }
    monitor.scriptUrls.push(url);
    if (status >= 400) {
      monitor.scriptFailures.push(`${status} ${url}`);
    }
  });

  page.on('requestfailed', (request) => {
    const url = request.url();
    if (isScriptRequest(url)) {
      monitor.scriptFailures.push(`FAILED ${url} ${request.failure()?.errorText || ''}`.trim());
    }
  });

  page.on('pageerror', (err) => {
    monitor.pageErrors.push(err.message);
  });
  page.on('console', (message) => {
    const text = message.text();
    if (
      message.type() === 'error' &&
      !text.startsWith('Warning:') &&
      !isExpectedSocketMockError(text)
    ) {
      const lastFailure = monitor.resourceFailures[monitor.resourceFailures.length - 1];
      const location = message.location();
      const detail =
        lastFailure && text.startsWith('Failed to load resource')
          ? `${text}: ${lastFailure}`
          : text;
      monitor.consoleErrors.push(
        location.url ? `${detail} @ ${location.url}:${location.lineNumber}` : detail,
      );
    }
  });

  await page.addInitScript((theme) => {
    window.localStorage.setItem(
      'settings',
      JSON.stringify({
        theme,
        color: 'default',
        improveAnimation: false,
        proMode: true,
        useAbsoluteTime: true,
      }),
    );
  }, resolved.theme);

  await page.route('**/google-analytics.com/analytics.js**', (route) =>
    route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/javascript',
      },
      body: '',
    }),
  );

  await page.route('**/vin.txt**', (route) =>
    route.fulfill({
      status: 200,
      headers: {
        'content-type': 'text/plain',
      },
      body: '',
    }),
  );

  await page.route('**/socket.io/**', (route) =>
    route.fulfill({
      status: 204,
      body: '',
    }),
  );

  await page.route(/\/onlinejudge3(?:_cs)?\/api\//, (route) => {
    const endpoint = getEndpoint(route.request().url());
    monitor.apiCalls.push(endpoint);
    const response = responseFor(endpoint, resolved);
    if ('status' in response) {
      return json(route, response.data, response.status);
    }
    return json(route, response);
  });

  return monitor;
}
