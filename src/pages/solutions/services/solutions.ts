import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetSolutionListReq,
  IGetSolutionListResp,
  IGetSolutionDetailReq,
  IGetSolutionDetailResp,
  ISubmitSolutionReq,
  ISubmitSolutionResp,
  IUpdateSolutionShareReq,
  IBatchGetSolutionDetailReq,
  IBatchGetSolutionDetailResp,
} from '@/common/contracts/solution';

export function getList(query) {
  return post<IGetSolutionListReq, IGetSolutionListResp>(routesBe.getSolutionList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.solutions.list,
    order: [['solutionId', 'DESC']],
  });
}

export function getListByIds({ solutionIds }) {
  return post<IGetSolutionListReq, IGetSolutionListResp>(routesBe.getSolutionList.url, {
    limit: limits.solutions.list,
    solutionIds,
  });
}

export function getDetail(solutionId) {
  return post<IGetSolutionDetailReq, IGetSolutionDetailResp>(routesBe.getSolutionDetail.url, {
    solutionId,
  });
}

export function batchGetDetail(solutionIds) {
  return post<IBatchGetSolutionDetailReq, IBatchGetSolutionDetailResp>(
    routesBe.batchGetSolutionDetail.url,
    {
      solutionIds,
    },
  );
}

export function submit(data) {
  return post<ISubmitSolutionReq, ISubmitSolutionResp>(routesBe.submitSolution.url, data);
}

export function changeShared(solutionId, shared) {
  return post<IUpdateSolutionShareReq, void>(routesBe.updateSolutionShare.url, {
    solutionId,
    shared,
  });
}
