import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';

export function getUserACRank(type: 'day' | 'week' | 'month') {
  return post(routesBe.getUserACRank.url, {
    type,
  });
}

export function getUserAcceptedProblems(userIds: number[]) {
  return post(routesBe.getUserAcceptedProblems.url, {
    userIds,
  });
}

export function getUserSubmittedProblems(userIds: number[]) {
  return post(routesBe.getUserSubmittedProblems.url, {
    userIds,
  });
}
