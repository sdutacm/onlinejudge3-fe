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
  },
  effects: {
    *getProblemList({ payload: query }, { call, put }) {
      if (query.tagIds && typeof query.tagIds === 'string') {
        query.tagIds = [query.tagIds];
      }
      if (query.tagIds && Array.isArray(query.tagIds)) {
        query.tagIds = query.tagIds.map((tagId) => +tagId);
      }
      const formattedQuery = formatListQuery(query);
      console.log('f', JSON.stringify(formattedQuery));
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
    *createProblem({ payload: { data } }, { call }) {
      return yield call(service.createProblem, data);
    },
    *updateProblemDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateProblemDetail, id, data);
    },
    *setProblemTags({ payload: { id, tagIds } }, { call }) {
      return yield call(service.setProblemTags, id, { tagIds });
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.admin.problems) {
          requestEffect(dispatch, { type: 'getProblemList', payload: query });
          requestEffect(dispatch, { type: 'getTagList' });
        }
      });
    },
  },
};
