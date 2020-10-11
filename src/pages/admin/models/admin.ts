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
  userList: {
    page: 1,
    count: 0,
    rows: [],
  },
  userDetail: {},
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
        } else if (pathname === pages.admin.users) {
          requestEffect(dispatch, { type: 'getUserList', payload: query });
        } else if (pathname === pages.admin.posts) {
          requestEffect(dispatch, { type: 'getPostList', payload: query });
        } else if (pathname === pages.admin.groups) {
          requestEffect(dispatch, { type: 'getGroupList', payload: query });
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
      });
    },
  },
};
