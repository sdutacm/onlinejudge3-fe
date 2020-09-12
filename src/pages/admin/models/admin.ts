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
  postList: {
    page: 1,
    count: 0,
    rows: [],
  },
  postDetail: {},
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
        } else if (pathname === pages.admin.posts) {
          requestEffect(dispatch, { type: 'getPostList', payload: query });
        }
      });
    },
  },
};
