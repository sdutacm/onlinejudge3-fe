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
  problemResultStats: {
    acceptedProblemIds: [],
    attemptedProblemIds: [],
  },
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
    setProblemResultStats(state, { payload: { data, query } }) {
      state.problemResultStats = {
        ...data,
        _query: query,
        ...genTimeFlag(60 * 1000),
      };
    },
    clearProblemResultStats(state) {
      state.problemResultStats = initialState.problemResultStats;
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
      const ret: ApiResponse<List<IUser> > = yield call(service.getList, formattedQuery);
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
    * getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.users.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: ApiResponse<IUser> = yield call(service.getDetail, id);
      if (ret.success) {
        yield put({
          type: 'setDetail',
          payload: {
            id,
            data: ret.data,
          },
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
    * getProblemResultStats({ payload: { userId, contestId, force = false } = { userId: null, contestId: null } },
                            { call, put, select }) {
      const globalSess = yield select(state => state.session);
      userId = userId || globalSess.user.userId;
      if (!userId) {
        return;
      }
      const formattedQuery = {
        userId,
        contestId,
      };
      if (!force) {
        const savedState = yield select(state => state.users.problemResultStats);
        if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
          return;
        }
      }
      const ret: ApiResponse<IUserProblemResultStats> = yield call(service.getProblemResultStats, userId, contestId);
      if (ret.success) {
        yield put({
          type: 'setProblemResultStats',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
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
          requestEffect(dispatch, { type: 'getDetail', payload: { id: matchDetail.params['id'] } });
        }
      });
    },
  },
};
