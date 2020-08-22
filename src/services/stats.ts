import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import {
  IGetUserACRankReq,
  IGetUserACRankResp,
  IGetUserAcceptedProblemsReq,
  IGetUserAcceptedProblemsResp,
  IGetUserSubmittedProblemsReq,
  IGetUserSubmittedProblemsResp,
} from '@/common/contracts/stat';

export function getUserACRank(type: 'day' | 'week' | 'month') {
  return post<IGetUserACRankReq, IGetUserACRankResp>(routesBe.getUserACRank.url, {
    type,
  });
}

export function getUserAcceptedProblems(userIds: number[]) {
  return post<IGetUserAcceptedProblemsReq, IGetUserAcceptedProblemsResp>(
    routesBe.getUserAcceptedProblems.url,
    {
      userIds,
    },
  );
}

export function getUserSubmittedProblems(userIds: number[]) {
  return post<IGetUserSubmittedProblemsReq, IGetUserSubmittedProblemsResp>(
    routesBe.getUserSubmittedProblems.url,
    {
      userIds,
    },
  );
}
