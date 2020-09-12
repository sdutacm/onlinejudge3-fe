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
import {
  IGetTagFullListReq,
  IGetTagFullListResp,
  ICreateTagReq,
  ICreateTagResp,
  IUpdateTagDetailReq,
} from '@/common/contracts/tag';
import {
  IGetContestListReq,
  IGetContestListResp,
  IGetContestDetailReq,
  IGetContestDetailResp,
  ICreateContestReq,
  ICreateContestResp,
  IUpdateContestDetailReq,
} from '@/common/contracts/contest';

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
  return post<IGetTagFullListReq, IGetTagFullListResp>(routesBe.getTagFullList.url, {
    _scope: null,
  });
}

export function createTag(data) {
  return post<ICreateTagReq, ICreateTagResp>(routesBe.createTag.url, {
    ...data,
  });
}

export function updateTagDetail(tagId, data) {
  return post<IUpdateTagDetailReq, void>(routesBe.updateTagDetail.url, {
    tagId,
    ...data,
  });
}

export function getContestList(query) {
  return post<IGetContestListReq, IGetContestListResp>(routesBe.getContestList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.admin.contestList,
    _scope: null,
  });
}

export function getContestDetail(contestId) {
  return post<IGetContestDetailReq, IGetContestDetailResp>(routesBe.getContestDetail.url, {
    contestId,
    _scope: null,
  });
}

export function createContest(data) {
  return post<ICreateContestReq, ICreateContestResp>(routesBe.createContest.url, {
    ...data,
  });
}

export function updateContestDetail(contestId, data) {
  return post<IUpdateContestDetailReq, void>(routesBe.updateContestDetail.url, {
    contestId,
    ...data,
  });
}
