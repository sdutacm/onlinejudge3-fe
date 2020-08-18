import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetProblemListReq,
  IGetProblemListResp,
  IGetProblemDetailReq,
  IGetProblemDetailResp,
  ISetProblemTagsReq,
  IUpdateProblemDetailReq,
} from '@/common/contracts/problem';
import { IGetTagFullListReq, IGetTagFullListResp } from '@/common/contracts/tag';

export function getList(query) {
  return post<IGetProblemListReq, IGetProblemListResp>(routesBe.getProblemList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.problems.list,
  });
}

export function getDetail(problemId) {
  return post<IGetProblemDetailReq, IGetProblemDetailResp>(routesBe.getProblemDetail.url, {
    problemId,
  });
}

export function getTagList() {
  return post<IGetTagFullListReq, IGetTagFullListResp>(routesBe.getTagFullList.url);
}

export function getProblemTags(id) {
  return;
}

export function setProblemTags(problemId, data) {
  return post<ISetProblemTagsReq, void>(routesBe.setProblemTags.url, {
    problemId,
    ...data,
  });
}

export function setProblemDifficulty(problemId, data) {
  return post<IUpdateProblemDetailReq, void>(routesBe.updateProblemDetail.url, {
    problemId,
    ...data,
  });
}
