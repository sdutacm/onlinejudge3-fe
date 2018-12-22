import * as service from '../services/users';
import { matchPath } from 'react-router';
import pages from '@/configs/pages';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
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
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { data, query } }) {
      state.list = {
        ...data,
        _query: query,
        ...genTimeFlag(60 * 1000),
      };
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 1000),
      };
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
    reset() {
      return { ...initialState };
    },
  },
  effects: {
    * getList({ payload: query }, { call, put, select }) {
      const formattedQuery = {
        ...formatListQuery(query),
        orderBy: 'accepted',
        orderDirection: 'DESC',
      };
      const savedState = yield select(state => state.users.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: ApiResponse<List<User> > = yield call(service.getList, formattedQuery);
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
    * getDetail({ payload: id }, { call, put, select }) {
      const savedState = yield select(state => state.users.detail[id]);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: ApiResponse<User> = yield call(service.getDetail, id);
      if (ret.success) {
        yield put({
          type: 'setDetail',
          payload: { id, data: ret.data },
        });
        yield put({
          type: 'clearExpiredDetail',
        });
      }
      return ret;
    },
    * register({ payload: data }, { call, put }) {
      return yield call(service.register, data);
    },
    * forgotPassword({ payload: data }, { call, put }) {
      return yield call(service.forgotPassword, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.users.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.users.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, { type: 'getDetail', payload: matchDetail.params['id'] });
        }
      });
    },
  },
};
