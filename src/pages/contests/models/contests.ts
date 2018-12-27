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
  problems: {},
  problemResultStats: {},
  ranklist: {},
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
    setProblems(state, { payload: { id, data } }) {
      state.problems[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredProblems(state) {
      state.problems = clearExpiredStateProperties(state.problems);
    },
    setProblemResultStats(state, { payload: { id, data } }) {
      state.problemResultStats[id] = {
        ...data,
        ...genTimeFlag(25 * 1000),
      };
    },
    clearExpiredProblemResultStats(state) {
      state.problemResultStats = clearExpiredStateProperties(state.problemResultStats);
    },
    setRanklist(state, { payload: { id, data } }) {
      state.ranklist[id] = {
        ...data,
        ...genTimeFlag(25 * 1000),
      };
    },
    clearExpiredRanklist(state) {
      state.ranklist = clearExpiredStateProperties(state.ranklist);
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
    * getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.contests.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
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
    * getProblems({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.contests.problems[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: ApiResponse<FullList<IProblem> > = yield call(service.getProblems, id);
      if (ret.success) {
        yield put({
          type: 'setProblems',
          payload: {
            id,
            data: ret.data,
          },
        });
        yield put({
          type: 'clearExpiredProblems',
        });
      }
      return ret;
    },
    * getProblemResultStats({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.contests.problemResultStats[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: ApiResponse<IContestProblemResultStats> = yield call(service.getProblemResultStats, id);
      if (ret.success) {
        yield put({
          type: 'setProblemResultStats',
          payload: {
            id,
            data: ret.data,
          },
        });
        yield put({
          type: 'clearExpiredProblemResultStats',
        });
      }
      return ret;
    },
    * getRanklist({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.contests.ranklist[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: ApiResponse<FullList<IRanklistRow> > = yield call(service.getRanklist, id);
      if (ret.success) {
        // 应先 clear，防止 set 时间过长导致又被 clear 掉
        yield put({
          type: 'clearExpiredRanklist',
        });
        yield put({
          type: 'setRanklist',
          payload: {
            id,
            data: ret.data,
          },
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
