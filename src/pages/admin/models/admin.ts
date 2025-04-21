import * as service from '../services/admin';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';

const initialState = {
  problemList: {
    page: 1,
    count: 0,
    rows: [],
  },
  problemDetail: {},
  problemDataFiles: {},
  tagList: {
    count: 0,
    rows: [],
  },
  contestList: {
    page: 1,
    count: 0,
    rows: [],
  },
  contestDetail: {},
  contestProblems: {},
  competitionList: {
    page: 1,
    count: 0,
    rows: [],
  },
  userList: {
    page: 1,
    count: 0,
    rows: [],
  },
  userDetail: {},
  allUserPermissions: {
    count: 0,
    rows: [],
  },
  postList: {
    page: 1,
    count: 0,
    rows: [],
  },
  postDetail: {},
  groupList: {
    page: 1,
    count: 0,
    rows: [],
  },
  groupDetail: {},
  fieldList: {
    page: 1,
    count: 0,
    rows: [],
  },
  fieldDetail: {},
};

export default {
  state: initialState,
  reducers: {
    setProblemList(state, { payload: { data } }) {
      state.problemList = {
        ...data,
      };
    },
    setProblemDetail(state, { payload: { id, data } }) {
      state.problemDetail[id] = {
        ...data,
      };
    },
    setProblemDataFiles(state, { payload: { id, data } }) {
      state.problemDataFiles[id] = data;
    },
    setTagList(state, { payload: { data } }) {
      state.tagList = {
        ...data,
      };
    },
    setContestList(state, { payload: { data } }) {
      state.contestList = {
        ...data,
      };
    },
    setContestDetail(state, { payload: { id, data } }) {
      state.contestDetail[id] = {
        ...data,
      };
    },
    setContestProblems(state, { payload: { id, data } }) {
      state.contestProblems[id] = data;
    },
    setCompetitionList(state, { payload: { data } }) {
      state.competitionList = {
        ...data,
      };
    },
    setUserList(state, { payload: { data } }) {
      state.userList = {
        ...data,
      };
    },
    setUserDetail(state, { payload: { id, data } }) {
      state.userDetail[id] = {
        ...data,
      };
    },
    setAllUserPermissions(state, { payload: { data } }) {
      state.allUserPermissions = {
        ...data,
      };
    },
    setPostList(state, { payload: { data } }) {
      state.postList = {
        ...data,
      };
    },
    setPostDetail(state, { payload: { id, data } }) {
      state.postDetail[id] = {
        ...data,
      };
    },
    setGroupList(state, { payload: { data } }) {
      state.groupList = {
        ...data,
      };
    },
    setGroupDetail(state, { payload: { id, data } }) {
      state.groupDetail[id] = {
        ...data,
      };
    },
    setFieldList(state, { payload: { data } }) {
      state.fieldList = {
        ...data,
      };
    },
    setFieldDetail(state, { payload: { id, data } }) {
      state.fieldDetail[id] = {
        ...data,
      };
    },
  },
  effects: {
    *getProblemList({ payload: query }, { call, put }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.problemId && (formattedQuery.problemId = +formattedQuery.problemId);
      formattedQuery.display && (formattedQuery.display = formattedQuery.display === 'true');
      const ret: IApiResponse<IList<IProblem>> = yield call(service.getProblemList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setProblemList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getProblemDetail({ payload: { id } }, { all, call, put }) {
      const detailRet: IApiResponse<any> = yield call(service.getProblemDetail, id);
      if (detailRet.success) {
        yield put({
          type: 'setProblemDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
      }
      return detailRet;
    },
    *getProblemDataFiles({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<any> = yield call(service.getJudgerDataFile, `${id}/`);
      if (ret.success) {
        yield put({
          type: 'setProblemDataFiles',
          payload: {
            id,
            data: ret.data?.files || [],
          },
        });
      }
      return ret;
    },
    *getDataFileDetail({ payload: { path } }, { call }) {
      return yield call(service.getJudgerDataFile, path);
    },
    *getJudgerDataArchive({ payload: { problemId } }, { call }) {
      return yield call(service.getJudgerDataArchive, { problemId });
    },
    *prepareJudgerDataUpdate(action, { call }) {
      return yield call(service.prepareJudgerDataUpdate);
    },
    *uploadJudgerData({ payload: { data } }, { call }) {
      return yield call(service.uploadJudgerData, data);
    },
    *createProblem({ payload: { data } }, { call }) {
      return yield call(service.createProblem, data);
    },
    *updateProblemDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateProblemDetail, id, data);
    },
    *setProblemTags({ payload: { id, tagIds } }, { call }) {
      return yield call(service.setProblemTags, id, { tagIds });
    },
    *getTagList(action, { call, put }) {
      const ret: IApiResponse<IFullList<ITag>> = yield call(service.getTagList);
      if (ret.success) {
        yield put({
          type: 'setTagList',
          payload: { data: ret.data },
        });
      }
      return ret;
    },
    *createTag({ payload: { data } }, { call }) {
      return yield call(service.createTag, data);
    },
    *updateTagDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateTagDetail, id, data);
    },
    *getContestList({ payload: query }, { call, put }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.contestId && (formattedQuery.contestId = +formattedQuery.contestId);
      formattedQuery.type && (formattedQuery.type = +formattedQuery.type);
      formattedQuery.category && (formattedQuery.category = +formattedQuery.category);
      formattedQuery.mode && (formattedQuery.mode = +formattedQuery.mode);
      formattedQuery.hidden && (formattedQuery.hidden = formattedQuery.hidden === 'true');
      formattedQuery.order = [['contestId', 'DESC']];
      const ret: IApiResponse<IList<IContest>> = yield call(service.getContestList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setContestList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getContestDetail({ payload: { id } }, { all, call, put }) {
      const detailRet: IApiResponse<any> = yield call(service.getContestDetail, id);
      if (detailRet.success) {
        yield put({
          type: 'setContestDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
      }
      return detailRet;
    },
    *createContest({ payload: { data } }, { call }) {
      return yield call(service.createContest, data);
    },
    *updateContestDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateContestDetail, id, data);
    },
    *auditContestUser({ payload: data }, { call }) {
      return yield call(service.auditContestUser, data);
    },
    *batchCreateContestUsers({ payload: data }, { call }) {
      return yield call(service.batchCreateContestUsers, data);
    },
    *getContestUsers({ payload: { id, status } }, { call }) {
      return yield call(service.getContestUsers, id, status);
    },
    *getContestProblemConfig({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<any> = yield call(service.getContestProblemConfig, id);
      if (ret.success) {
        yield put({
          type: 'setContestProblems',
          payload: {
            id,
            data: ret.data.rows,
          },
        });
      }
      return ret;
    },
    *setContestProblemConfig({ payload: { id, problems } }, { call }) {
      return yield call(service.setContestProblemConfig, id, problems);
    },
    *getCompetitionList({ payload: query }, { call, put }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.competitionId &&
        (formattedQuery.competitionId = +formattedQuery.competitionId);
      formattedQuery.isTeam && (formattedQuery.isTeam = formattedQuery.isTeam === 'true');
      formattedQuery.hidden && (formattedQuery.hidden = formattedQuery.hidden === 'true');
      formattedQuery.order = [['competitionId', 'DESC']];
      const ret: IApiResponse<IList<IContest>> = yield call(
        service.getCompetitionList,
        formattedQuery,
      );
      if (ret.success) {
        yield put({
          type: 'setCompetitionList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *createCompetition({ payload: { data } }, { call }) {
      return yield call(service.createCompetition, data);
    },
    *rejudgeSolution({ payload: data }, { call }) {
      return yield call(service.rejudgeSolution, data);
    },
    *getUserList({ payload: query }, { call, put }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.userId && (formattedQuery.userId = +formattedQuery.userId);
      formattedQuery.forbidden && (formattedQuery.forbidden = +formattedQuery.forbidden);
      formattedQuery.permission && (formattedQuery.permission = +formattedQuery.permission);
      formattedQuery.verified && (formattedQuery.verified = formattedQuery.verified === 'true');
      formattedQuery.order = [['userId', 'ASC']];
      const ret: IApiResponse<IList<IUser>> = yield call(service.getUserList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setUserList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getUserDetail({ payload: { id } }, { all, call, put }) {
      const detailRet: IApiResponse<any> = yield call(service.getUserDetail, id);
      if (detailRet.success) {
        yield put({
          type: 'setUserDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
      }
      return detailRet;
    },
    *createUser({ payload: { data } }, { call }) {
      return yield call(service.createUser, data);
    },
    *batchCreateUsers({ payload: data }, { call }) {
      return yield call(service.batchCreateUsers, data);
    },
    *updateUserDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateUserDetail, id, data);
    },
    *resetUserPasswordByAdmin({ payload: { id, password } }, { call }) {
      return yield call(service.resetUserPasswordByAdmin, id, password);
    },
    *getAllUserPermissions({ payload }, { all, call, put }) {
      const ret: IApiResponse<any> = yield call(service.getAllUserPermissionsMap);
      if (ret.success) {
        yield put({
          type: 'setAllUserPermissions',
          payload: {
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *setUserPermissions({ payload: { userId, permissions } }, { call }) {
      return yield call(service.setUserPermissions, userId, permissions);
    },
    *getPostList({ payload: query }, { call, put }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.postId && (formattedQuery.postId = +formattedQuery.postId);
      formattedQuery.display && (formattedQuery.display = formattedQuery.display === 'true');
      formattedQuery.order = [['postId', 'DESC']];
      const ret: IApiResponse<IList<IPost>> = yield call(service.getPostList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setPostList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getPostDetail({ payload: { id } }, { all, call, put }) {
      const detailRet: IApiResponse<any> = yield call(service.getPostDetail, id);
      if (detailRet.success) {
        yield put({
          type: 'setPostDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
      }
      return detailRet;
    },
    *createPost({ payload: { data } }, { call }) {
      return yield call(service.createPost, data);
    },
    *updatePostDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updatePostDetail, id, data);
    },
    *getGroupList({ payload: query }, { call, put }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.groupId && (formattedQuery.groupId = +formattedQuery.groupId);
      formattedQuery.joinChannel && (formattedQuery.joinChannel = +formattedQuery.joinChannel);
      formattedQuery.verified && (formattedQuery.verified = formattedQuery.verified === 'true');
      formattedQuery.private && (formattedQuery.private = formattedQuery.private === 'true');
      formattedQuery.order = [['groupId', 'DESC']];
      const ret: IApiResponse<IList<IGroup>> = yield call(service.getGroupList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setGroupList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getGroupDetail({ payload: { id } }, { all, call, put }) {
      const detailRet: IApiResponse<any> = yield call(service.getGroupDetail, id);
      if (detailRet.success) {
        yield put({
          type: 'setGroupDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
      }
      return detailRet;
    },
    *createGroup({ payload: { data } }, { call }) {
      return yield call(service.createGroup, data);
    },
    *updateGroupDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateGroupDetail, id, data);
    },
    *getFieldList({ payload: query }, { call, put }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.fieldId && (formattedQuery.fieldId = +formattedQuery.fieldId);
      formattedQuery.display && (formattedQuery.display = formattedQuery.display === 'true');
      formattedQuery.order = [['fieldId', 'DESC']];
      const ret: IApiResponse<IList<IField>> = yield call(service.getFieldList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setFieldList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getFieldDetail({ payload: { id } }, { all, call, put }) {
      const detailRet: IApiResponse<any> = yield call(service.getFieldDetail, id);
      if (detailRet.success) {
        yield put({
          type: 'setFieldDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
      }
      return detailRet;
    },
    *createField({ payload: { data } }, { call }) {
      return yield call(service.createField, data);
    },
    *updateFieldDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateFieldDetail, id, data);
    },
    *deleteField({ payload: { id } }, { call }) {
      return yield call(service.deleteField, id);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.admin.problems) {
          requestEffect(dispatch, { type: 'getProblemList', payload: query });
          requestEffect(dispatch, { type: 'getTagList' });
        } else if (pathname === pages.admin.tags) {
          requestEffect(dispatch, { type: 'getTagList' });
        } else if (pathname === pages.admin.contests) {
          requestEffect(dispatch, { type: 'getContestList', payload: query });
        }else if (pathname === pages.admin.competitions) {
          requestEffect(dispatch, { type: 'getCompetitionList', payload: query });
        } else if (pathname === pages.admin.users) {
          requestEffect(dispatch, { type: 'getUserList', payload: query });
        } else if (pathname === pages.admin.userPermissions) {
          requestEffect(dispatch, { type: 'getAllUserPermissions' });
        } else if (pathname === pages.admin.posts) {
          requestEffect(dispatch, { type: 'getPostList', payload: query });
        } else if (pathname === pages.admin.groups) {
          requestEffect(dispatch, { type: 'getGroupList', payload: query });
        } else if (pathname === pages.admin.fields) {
          requestEffect(dispatch, { type: 'getFieldList', payload: query });
        }
        const matchProblemDataFileList = matchPath(pathname, {
          path: pages.admin.problemDataFiles,
          exact: true,
        });
        if (matchProblemDataFileList) {
          requestEffect(dispatch, {
            type: 'getProblemDataFiles',
            payload: { id: +matchProblemDataFileList.params['id'] },
          });
          requestEffect(dispatch, {
            type: 'getProblemDetail',
            payload: { id: +matchProblemDataFileList.params['id'] },
          });
        }
        const matchContestUserList = matchPath(pathname, {
          path: pages.admin.contestUsers,
          exact: true,
        });
        if (matchContestUserList) {
          requestEffect(dispatch, {
            type: 'contests/getUserList',
            payload: { query, cid: +matchContestUserList.params['id'] },
          });
          requestEffect(dispatch, {
            type: 'getContestDetail',
            payload: { id: +matchContestUserList.params['id'] },
          });
        }
        const matchContestProblemList = matchPath(pathname, {
          path: pages.admin.contestProblems,
          exact: true,
        });
        if (matchContestProblemList) {
          requestEffect(dispatch, {
            type: 'getContestProblemConfig',
            payload: { id: +matchContestProblemList.params['id'] },
          });
          requestEffect(dispatch, {
            type: 'getContestDetail',
            payload: { id: +matchContestProblemList.params['id'] },
          });
        }
        const matchFieldSettings = matchPath(pathname, {
          path: pages.admin.fieldSettings,
          exact: true,
        });
        if (matchFieldSettings) {
          requestEffect(dispatch, {
            type: 'getFieldDetail',
            payload: { id: +matchFieldSettings.params['id'] },
          });
        }
      });
    },
  },
};
