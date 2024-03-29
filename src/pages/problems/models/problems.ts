import * as service from '../services/problems';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash-es';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';

const initialState = {
  list: {
    page: 1,
    count: 0,
    rows: [],
    _query: {},
  },
  detail: {},
  tagList: {
    count: 0,
    rows: [],
  },
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { data, query } }) {
      state.list = {
        ...data,
        _query: query,
        ...genTimeFlag(5 * 60 * 1000),
      };
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    setTagList(state, { payload: { data } }) {
      state.tagList = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
  },
  effects: {
    *getList({ payload: q }, { call, put, select }) {
      const query = { ...q };
      if (query.author) {
        query.authors = [query.author];
        delete query.author;
      }
      if (query.tagIds && typeof query.tagIds === 'string') {
        query.tagIds = [query.tagIds];
      }
      if (query.tagIds && Array.isArray(query.tagIds)) {
        query.tagIds = query.tagIds.map(tagId => +tagId);
      }
      const formattedQuery = formatListQuery(query);
      const savedState = yield select((state) => state.problems.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<IProblem>> = yield call(service.getList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getDetail({ payload: { id, force = false } }, { all, call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.problems.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const detailRet: IApiResponse<any> = yield call(service.getDetail, id);
      if (detailRet.success) {
        yield put({
          type: 'clearExpiredDetail',
        });
        yield put({
          type: 'setDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
      }
      return detailRet;
    },
    *getTagList(action, { call, put, select }) {
      const savedState = yield select((state) => state.problems.tagList);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: IApiResponse<IFullList<ITag>> = yield call(service.getTagList);
      if (ret.success) {
        yield put({
          type: 'setTagList',
          payload: { data: ret.data },
        });
      }
      return ret;
    },
    *modifyProblemTags({ payload: { id, tagIds } }, { call }) {
      return yield call(service.setProblemTags, id, { tagIds });
    },
    *modifyProblemDifficulty({ payload: { id, difficulty } }, { call }) {
      return yield call(service.setProblemDifficulty, id, { difficulty });
    },
    // * reloadList(action, { put, select }) {
    //   const page = yield select(state => state.problems.query.page);
    //   const title = yield select(state => state.problems.query.title);
    //   yield put({ type: 'getList', payload: { page, title } });
    // },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.problems.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
          requestEffect(dispatch, { type: 'getTagList' });
          requestEffect(dispatch, { type: 'users/getProblemResultStats' });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.problems.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, {
            type: 'getDetail',
            payload: { id: +matchDetail.params['id'] },
          });
        }
      });
    },
  },
};
