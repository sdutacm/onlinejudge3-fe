import { post, get } from '@/utils/request';
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
import { IGetLanguageConfigResp } from '@/common/contracts/judger';

export function getList(query) {
  const q = { ...query };
  if (q.lt === undefined && q.gt === undefined) {
    q.lt = null;
  }
  delete q._r;
  return post<IGetSolutionListReq, IGetSolutionListResp>(routesBe.getSolutionList.url, {
    ...q,
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

export function getLanguageConfig() {
  return post<void, IGetLanguageConfigResp>(routesBe.getLanguageConfig.url);
}
