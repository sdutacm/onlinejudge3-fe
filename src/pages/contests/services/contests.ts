import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetContestListReq,
  IGetContestListResp,
  IGetContestUserListReq,
  IGetContestUserListResp,
  IGetContestSessionReq,
  IGetContestSessionResp,
  IRequestContestSessionReq,
  IRequestContestSessionResp,
  ILogoutContestReq,
  IGetContestDetailReq,
  IGetContestDetailResp,
  IGetContestProblemsReq,
  IGetContestProblemsResp,
  IGetContestProblemSolutionStatsReq,
  IGetContestProblemSolutionStatsResp,
  IGetContestUserDetailReq,
  IGetContestUserDetailResp,
  ICreateContestUserReq,
  ICreateContestUserResp,
  IUpdateContestUserReq,
  IGetContestRanklistReq,
  IGetContestRanklistResp,
  IEndContestReq,
  IGetContestRatingStatusReq,
  IGetContestRatingStatusResp,
} from '@/common/contracts/contest';

export function getList(query) {
  return post<IGetContestListReq, IGetContestListResp>(routesBe.getContestList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.contests.list,
  });
}

export function getUserList(query, contestId) {
  return post<IGetContestUserListReq, IGetContestUserListResp>(routesBe.getContestUserList.url, {
    contestId,
    ...query,
    page: query.page || 1,
    limit: limits.contests.list,
  });
}

export function getSession(contestId) {
  return post<IGetContestSessionReq, IGetContestSessionResp>(routesBe.getContestSession.url, {
    contestId,
  });
}

export function login(contestId, data) {
  return post<IRequestContestSessionReq, IRequestContestSessionResp>(
    routesBe.requestContestSession.url,
    {
      contestId,
      ...data,
    },
  );
}

export function logout(contestId) {
  return post<ILogoutContestReq, void>(routesBe.logoutContest.url, {
    contestId,
  });
}

export function getDetail(contestId) {
  return post<IGetContestDetailReq, IGetContestDetailResp>(routesBe.getContestDetail.url, {
    contestId,
  });
}

export function getProblems(contestId) {
  return post<IGetContestProblemsReq, IGetContestProblemsResp>(routesBe.getContestProblems.url, {
    contestId,
  });
}

export function getProblemResultStats(contestId) {
  return post<IGetContestProblemSolutionStatsReq, IGetContestProblemSolutionStatsResp>(
    routesBe.getContestProblemSolutionStats.url,
    {
      contestId,
    },
  );
}

export function registerUser(contestId, data) {
  return post<ICreateContestUserReq, ICreateContestUserResp>(routesBe.createContestUser.url, {
    contestId,
    ...data,
  });
}

export function modifyUser(contestId, contestUserId, data) {
  return post<IUpdateContestUserReq, void>(routesBe.updateContestUser.url, {
    contestId,
    contestUserId,
    ...data,
  });
}

export function getRanklist(contestId, god = false) {
  return post<IGetContestRanklistReq, IGetContestRanklistResp>(routesBe.getContestRanklist.url, {
    contestId,
    god,
  });
}

export function addContestUser(contestId, data) {
  return post<ICreateContestUserReq, ICreateContestUserResp>(routesBe.createContestUser.url, {
    contestId,
    ...data,
  });
}

export function getContestUser(contestUserId) {
  return post<IGetContestUserDetailReq, IGetContestUserDetailResp>(
    routesBe.getContestUserDetail.url,
    {
      contestUserId,
    },
  );
}

export function updateContestUser(contestId, contestUserId, data) {
  return post<IUpdateContestUserReq, void>(routesBe.updateContestUser.url, {
    contestId,
    contestUserId,
    ...data,
  });
}

export function endContest(contestId) {
  return post<IEndContestReq, void>(routesBe.endContest.url, {
    contestId,
  });
}

export function getRatingStatus(contestId) {
  return post<IGetContestRatingStatusReq, IGetContestRatingStatusResp>(
    routesBe.getContestRatingStatus.url,
    {
      contestId,
    },
  );
}

export function getContest(contestId) {
  return post<IGetContestListReq, IGetContestListResp>(routesBe.getContestList.url, {
    contestId,
    limit: 1,
  });
}
