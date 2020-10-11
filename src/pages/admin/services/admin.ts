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
  IAuditContestUserReq,
  IBatchCreateContestUsersReq,
  IGetContestUsersReq,
  IGetContestUsersResp,
  IGetContestProblemConfigReq,
  IGetContestProblemConfigResp,
  ISetContestProblemConfigReq,
} from '@/common/contracts/contest';
import {
  IGetPostListReq,
  IGetPostListResp,
  IGetPostDetailReq,
  IGetPostDetailResp,
  ICreatePostReq,
  ICreatePostResp,
  IUpdatePostDetailReq,
} from '@/common/contracts/post';
import {
  IGetGroupListReq,
  IGetGroupListResp,
  IGetGroupDetailReq,
  IGetGroupDetailResp,
  ICreateGroupReq,
  ICreateGroupResp,
  IUpdateGroupDetailReq,
} from '@/common/contracts/group';
import {
  IGetUserListReq,
  IGetUserListResp,
  IGetUserDetailReq,
  IGetUserDetailResp,
  ICreateUserReq,
  ICreateUserResp,
  IUpdateUserDetailReq,
  IResetUserPasswordByAdminReq,
  IBatchCreateUsersReq,
} from '@/common/contracts/user';
import { IRejudgeSolutionReq } from '@/common/contracts/solution';

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

export function getContestUsers(contestId, status) {
  return post<IGetContestUsersReq, IGetContestUsersResp>(routesBe.getContestUsers.url, {
    contestId,
    status,
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

export function batchCreateContestUsers(data) {
  return post<IBatchCreateContestUsersReq, void>(routesBe.batchCreateContestUsers.url, {
    ...data,
  });
}

export function updateContestDetail(contestId, data) {
  return post<IUpdateContestDetailReq, void>(routesBe.updateContestDetail.url, {
    contestId,
    ...data,
  });
}

export function auditContestUser(data) {
  return post<IAuditContestUserReq, void>(routesBe.auditContestUser.url, {
    ...data,
  });
}

export function getContestProblemConfig(contestId) {
  return post<IGetContestProblemConfigReq, IGetContestProblemConfigResp>(
    routesBe.getContestProblemConfig.url,
    {
      contestId,
    },
  );
}

export function setContestProblemConfig(contestId, problems) {
  return post<ISetContestProblemConfigReq, void>(routesBe.setContestProblemConfig.url, {
    contestId,
    problems,
  });
}

export function rejudgeSolution(data) {
  return post<IRejudgeSolutionReq, void>(routesBe.rejudgeSolution.url, {
    ...data,
  });
}

export function getUserList(query) {
  return post<IGetUserListReq, IGetUserListResp>(routesBe.getUserList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.admin.userList,
    _scope: null,
  });
}

export function getUserDetail(userId) {
  return post<IGetUserDetailReq, IGetUserDetailResp>(routesBe.getUserDetail.url, {
    userId,
    _scope: null,
  });
}

export function createUser(data) {
  return post<ICreateUserReq, ICreateUserResp>(routesBe.createUser.url, {
    ...data,
  });
}

export function batchCreateUsers(data) {
  return post<IBatchCreateUsersReq, void>(routesBe.batchCreateUsers.url, {
    ...data,
  });
}

export function resetUserPasswordByAdmin(userId, password) {
  return post<IResetUserPasswordByAdminReq, void>(routesBe.resetUserPasswordByAdmin.url, {
    userId,
    password,
  });
}

export function updateUserDetail(userId, data) {
  return post<IUpdateUserDetailReq, void>(routesBe.updateUserDetail.url, {
    userId,
    ...data,
  });
}

export function getPostList(query) {
  return post<IGetPostListReq, IGetPostListResp>(routesBe.getPostList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.admin.postList,
    _scope: null,
  });
}

export function getPostDetail(postId) {
  return post<IGetPostDetailReq, IGetPostDetailResp>(routesBe.getPostDetail.url, {
    postId,
    _scope: null,
  });
}

export function createPost(data) {
  return post<ICreatePostReq, ICreatePostResp>(routesBe.createPost.url, {
    ...data,
  });
}

export function updatePostDetail(postId, data) {
  return post<IUpdatePostDetailReq, void>(routesBe.updatePostDetail.url, {
    postId,
    ...data,
  });
}

export function getGroupList(query) {
  return post<IGetGroupListReq, IGetGroupListResp>(routesBe.getGroupList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.admin.groupList,
  });
}

export function getGroupDetail(groupId) {
  return post<IGetGroupDetailReq, IGetGroupDetailResp>(routesBe.getGroupDetail.url, {
    groupId,
  });
}

export function createGroup(data) {
  return post<ICreateGroupReq, ICreateGroupResp>(routesBe.createGroup.url, {
    ...data,
  });
}

export function updateGroupDetail(groupId, data) {
  return post<IUpdateGroupDetailReq, void>(routesBe.updateGroupDetail.url, {
    groupId,
    ...data,
  });
}
