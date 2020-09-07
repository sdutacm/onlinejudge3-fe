import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetProblemListReq,
  IGetProblemListResp,
  IGetProblemDetailReq,
  IGetProblemDetailResp,
  IUpdateProblemDetailReq,
  ISetProblemTagsReq,
  ICreateProblemReq,
  ICreateProblemResp,
} from '@/common/contracts/problem';
import { IGetTagFullListReq, IGetTagFullListResp } from '@/common/contracts/tag';

export function getProblemList(query) {
  return post<IGetProblemListReq, IGetProblemListResp>(routesBe.getProblemList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.admin.problemList,
    _scope: null,
  });
}

export function getProblemDetail(problemId) {
  return post<IGetProblemDetailReq, IGetProblemDetailResp>(routesBe.getProblemDetail.url, {
    problemId,
    _scope: null,
  });
}

export function createProblem(data) {
  return post<ICreateProblemReq, ICreateProblemResp>(routesBe.createProblem.url, {
    ...data,
  });
}

export function updateProblemDetail(problemId, data) {
  return post<IUpdateProblemDetailReq, void>(routesBe.updateProblemDetail.url, {
    problemId,
    ...data,
  });
}

export function setProblemTags(problemId, data) {
  return post<ISetProblemTagsReq, void>(routesBe.setProblemTags.url, {
    problemId,
    ...data,
  });
}

export function getTagList() {
  return post<IGetTagFullListReq, IGetTagFullListResp>(routesBe.getTagFullList.url);
}
