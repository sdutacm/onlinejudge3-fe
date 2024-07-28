import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IRegisterReq,
  IRegisterResp,
  IResetUserPasswordReq,
  IGetUserListReq,
  IGetUserListResp,
  IGetUserDetailReq,
  IGetUserDetailResp,
  IGetUserProblemResultStatsReq,
  IGetUserProblemResultStatsResp,
  IGetUserSolutionCalendarReq,
  IGetUserSolutionCalendarResp,
  IUpdateUserPasswordReq,
  IUpdateUserDetailReq,
  IUpdateUserEmailReq,
  IResetUserPasswordAndEmailReq,
  IGetSelfCompletedAchievementsResp,
} from '@/common/contracts/user';

export function register(data) {
  return post<IRegisterReq, IRegisterResp>(routesBe.register.url, data);
}

export function forgotPassword(data) {
  return post<IResetUserPasswordReq, void>(routesBe.resetUserPassword.url, data);
}

export function resetPasswordAndEmail(data) {
  return post<IResetUserPasswordAndEmailReq, void>(routesBe.resetUserPasswordAndEmail.url, data);
}

export function getList(query) {
  return post<IGetUserListReq, IGetUserListResp>(routesBe.getUserList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.users.list,
  });
}

export function getDetail(userId) {
  return post<IGetUserDetailReq, IGetUserDetailResp>(routesBe.getUserDetail.url, {
    userId,
  });
}

export function getProblemResultStats(userId, contestId = undefined, competitionId = undefined) {
  return post<IGetUserProblemResultStatsReq, IGetUserProblemResultStatsResp>(
    routesBe.getUserProblemResultStats.url,
    {
      userId,
      contestId,
      competitionId,
    },
  );
}

export function getSolutionStats(id) {
  return;
}

export function getSolutionCalendar(userId, result) {
  return post<IGetUserSolutionCalendarReq, IGetUserSolutionCalendarResp>(
    routesBe.getUserSolutionCalendar.url,
    {
      userId,
      result,
    },
  );
}

export function getRatingHistory(id) {
  return;
}

export function changePassword(userId, data) {
  return post<IUpdateUserPasswordReq, void>(routesBe.updateUserPassword.url, {
    userId,
    ...data,
  });
}

export function editProfile(userId, data) {
  return post<IUpdateUserDetailReq, void>(routesBe.updateUserDetail.url, {
    userId,
    ...data,
  });
}

export function changeEmail(userId, data) {
  return post<IUpdateUserEmailReq, void>(routesBe.updateUserEmail.url, {
    userId,
    ...data,
  });
}

export function getSelfCompletedAchievements() {
  return post<void, IGetSelfCompletedAchievementsResp>(routesBe.getSelfCompletedAchievements.url);
}
