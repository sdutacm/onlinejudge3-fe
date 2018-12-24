import * as service from '../services/contests';
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
  session: {},
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
    setSession(state, { payload: { id, data } }) {
      state.session[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearSession(state, { payload: { id } }) {
      state.session[id] = {
        loggedIn: false,
        user: {},
      };
    },
    clearAllSessions(state) {
      state.session = {};
    },
    clearExpiredSession(state) {
      state.session = clearExpiredStateProperties(state.session);
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
  },
  effects: {
    * getList({ payload: query }, { call, put, select }) {
      const formattedQuery = {
        ...formatListQuery(query),
        orderBy: 'contestId',
        orderDirection: 'DESC',
      };
      const savedState = yield select(state => state.contests.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: ApiResponse<List<IContest> > = yield call(service.getList, formattedQuery);
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
    * getSession({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.contests.session[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: ApiResponse<ISession> = yield call(service.getSession, id);
      if (ret.success) {
        yield put({
          type: 'setSession',
          payload: {
            id,
            data: {
              loggedIn: true,
              user: ret.data,
            },
          },
        });
        yield put({
          type: 'clearExpiredSession',
        });
      }
      else {
        yield put({
          type: 'setSession',
          payload: {
            id,
            data: {
              loggedIn: false,
              user: {},
              _code: ret.code,
            },
          },
        });
      }
      return ret;
    },
    * login({ payload: { id, data } }, { call, put }) {
      const ret: ApiResponse<ISession> = yield call(service.login, id, data);
      if (ret.success) {
        yield put({
          type: 'setSession',
          payload: {
            id,
            data: ret.data,
          },
        });
        yield put({
          type: 'clearExpiredSession',
        });
      }
      return ret;
    },
    * logout({ payload: { id } }, { call, put }) {
      const ret: ApiResponse<ISession> = yield call(service.logout, id);
      if (ret.success) {
        yield put({
          type: 'clearSession',
          payload: {
            id,
          },
        });
      }
      return ret;
    },
    // 仅能在登出 OJ 用户后由调用者触发，暂不支持主动触发，因为后端没有相应接口
    * clearAllContestSessions(action, { call, put }) {
      yield put({
        type: 'clearAllSessions',
      });
    },
    * getDetail({ payload: { id } }, { call, put, select }) {
      const savedState = yield select(state => state.contests.detail[id]);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: ApiResponse<IContest> = yield call(service.getDetail, id);
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
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.contests.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        // const matchContest = matchPath(pathname, {
        //   path: pages.contests.home,
        // });
        // if (matchContest) {
        //   requestEffect(dispatch, { type: 'getSession', payload: matchContest.params['id'] });
        // }
      });
    },
  },
};
