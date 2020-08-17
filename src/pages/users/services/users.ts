import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';

export function register(data) {
  return post(routesBe.register.url, data);
}

export function forgotPassword(data) {
  return post(routesBe.resetUserPassword.url, data);
}

export function getList(query) {
  return post(routesBe.getUserList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.users.list,
  });
}

export function getDetail(userId) {
  return post(routesBe.getUserDetail.url, {
    userId,
  });
}

export function getProblemResultStats(userId, contestId = undefined) {
  return post(routesBe.getUserProblemResultStats.url, {
    userId,
    contestId,
  });
}

export function getSolutionStats(id) {
  return;
}

export function getSolutionCalendar(userId, result) {
  return post(routesBe.getUserSolutionCalendar.url, {
    userId,
    result,
  });
}

export function getRatingHistory(id) {
  return;
}

export function changePassword(userId, data) {
  return post(routesBe.updateUserPassword.url, {
    userId,
    ...data,
  });
}

export function editProfile(userId, data) {
  return post(routesBe.updateUserDetail.url, {
    userId,
    ...data,
  });
}

export function changeEmail(userId, data) {
  return post(routesBe.updateUserEmail.url, {
    userId,
    ...data,
  });
}
