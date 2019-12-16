import { get, post, patch } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';
import limits from '@/configs/limits';

export function register(data) {
  return post(api.users.base, data);
}

export function forgotPassword(data) {
  return patch(urlf(api.users.password, { param: { id: 0 } }), data);
}

export function getList(query) {
  const url = urlf(api.users.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.users.list,
    },
  });
  return get(url);
}

export function getDetail(id) {
  const url = urlf(api.users.detail, {
    param: {
      id,
    },
  });
  return get(url, 1000);
}

export function getProblemResultStats(userId, contestId = null) {
  const url = urlf(api.users.problemResultStats, {
    param: {
      id: userId,
    },
    query: {
      contestId,
    },
  });
  return get(url);
}

export function getSolutionStats(id) {
  const url = urlf(api.users.solutionStats, {
    param: {
      id,
    },
  });
  return get(url);
}

export function getSolutionCalendar(id, result) {
  const url = urlf(api.users.solutionCalendar, {
    param: {
      id,
    },
    query: {
      result,
    },
  });
  return get(url);
}

export function getRatingHistory(id) {
  const url = urlf(api.users.ratingHistory, {
    param: {
      id,
    },
  });
  return get(url);
}

export function changePassword(id, data){
  return patch(urlf(api.users.password, {
    param: {
      id,
    },
  }), data);
}

export function editProfile(id, data){
  return patch(urlf(api.users.detail, {
    param: {
      id,
    },
  }), data);
}
