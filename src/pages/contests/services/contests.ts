import { get, post, patch, del } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.contests.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: query.limit || limits.contests.list,
    },
  });
  return get(url);
}

export function getUserList(query, id) {
  const url = urlf(api.contests.users, {
    param: { id },
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.contests.list,
    },
  });
  return get(url);
}

export function getSession(id) {
  const url = urlf(api.contests.session, { param: { id } });
  return get(url);
}

export function login(id, data) {
  const url = urlf(api.contests.session, { param: { id } });
  return post(url, data);
}

export function logout(id) {
  const url = urlf(api.contests.session, { param: { id } });
  return del(url);
}

export function getDetail(id) {
  const url = urlf(api.contests.detail, { param: { id } });
  return get(url, 1000);
}

export function getProblems(id) {
  const url = urlf(api.contests.problems, { param: { id } });
  return get(url);
}

export function getProblemResultStats(id) {
  const url = urlf(api.contests.problemResultStats, { param: { id } });
  return get(url);
}

export function getUsers(id) {
  const url = urlf(api.contests.users, { param: { id } });
  return get(url);
}

export function getUserDetail(id, uid) {
  const url = urlf(api.contests.userDetail, { param: { id, uid } });
  return get(url);
}

export function registerUser(id, data) {
  const url = urlf(api.contests.users, { param: { id } });
  return post(url, data);
}

export function modifyUser(id, uid, data) {
  const url = urlf(api.contests.userDetail, { param: { id, uid } });
  return patch(url, data);
}

export function getRanklist(id) {
  const url = urlf(api.contests.ranklist, { param: { id } });
  return get(url);
}

export function addContestUser(id, data) {
  const url = urlf(api.contests.users, { param: { id } });
  return post(url, data);
}

export function getContestUser(id, uid) {
  const url = urlf(api.contests.userDetail, { param: { id, uid } });
  return get(url);
}

export function updateContestUser(id, uid, data) {
  const url = urlf(api.contests.userDetail, { param: { id, uid } });
  return patch(url, data);
}

export function endContest(id) {
  const url = urlf(api.contests.end, { param: { id } });
  return post(url);
}

export function getRatingStatus(id) {
  const url = urlf(api.contests.ratingStatus, { param: { id } });
  return get(url);
}
