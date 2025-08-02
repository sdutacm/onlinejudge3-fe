import request, { post, originalRequest } from '@/utils/request';
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
  IGetAllUserPermissionsMapResp,
  ISetUserPermissionsReq,
} from '@/common/contracts/user';
import { IRejudgeSolutionReq } from '@/common/contracts/solution';
import { IGetJudgerDataFileReq, IGetJudgerDataFileResp } from '@/common/contracts/judger';
import {
  IGetFieldListReq,
  IGetFieldListResp,
  IGetFieldDetailReq,
  IGetFieldDetailResp,
  ICreateFieldReq,
  ICreateFieldResp,
  IUpdateFieldDetailReq,
  IDeleteFieldReq,
} from '@/common/contracts/field';
import {
  IGetCompetitionListReq,
  IGetCompetitionListResp,
  ICreateCompetitionReq,
  ICreateCompetitionResp,
} from '@/common/contracts/competition';

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

export function getCompetitionList(query) {
  return post<IGetCompetitionListReq, IGetCompetitionListResp>(routesBe.getCompetitionList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.admin.contestList,
    _scope: null,
  });
}

export function createCompetition(data) {
  return post<ICreateCompetitionReq, ICreateCompetitionResp>(routesBe.createCompetition.url, {
    ...data,
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

export function getAllUserPermissionsMap() {
  return post<void, IGetAllUserPermissionsMapResp>(routesBe.getAllUserPermissionsMap.url);
}

export function setUserPermissions(userId, permissions) {
  return post<ISetUserPermissionsReq, void>(routesBe.setUserPermissions.url, {
    userId,
    permissions,
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
    _scope: null,
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

export function getJudgerDataFile(path: string) {
  return post<IGetJudgerDataFileReq, IGetJudgerDataFileResp>(routesBe.getJudgerDataFile.url, {
    path,
  });
}

export function getJudgerDataArchive(data) {
  return originalRequest(routesBe.getJudgerDataArchive.url, {
    method: 'post',
    data,
    responseType: 'blob',
  });
}

export function prepareJudgerDataUpdate() {
  return post<void, void>(routesBe.prepareJudgerDataUpdate.url);
}

export function uploadJudgerData(data) {
  return request(routesBe.uploadJudgerData.url, {
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data;charset=UTF-8',
    },
    timeout: 5 * 60 * 1000,
  });
}

export function getFieldList(query) {
  return post<IGetFieldListReq, IGetFieldListResp>(routesBe.getFieldList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.admin.postList,
    _scope: null,
  });
}

export function getFieldDetail(fieldId) {
  return post<IGetFieldDetailReq, IGetFieldDetailResp>(routesBe.getFieldDetail.url, {
    fieldId,
    _scope: null,
  });
}

export function createField(data) {
  return post<ICreateFieldReq, ICreateFieldResp>(routesBe.createField.url, {
    ...data,
  });
}

export function updateFieldDetail(fieldId, data) {
  return post<IUpdateFieldDetailReq, void>(routesBe.updateFieldDetail.url, {
    fieldId,
    ...data,
  });
}

export function deleteField(fieldId) {
  return post<IDeleteFieldReq, void>(routesBe.deleteField.url, {
    fieldId,
  });
}
