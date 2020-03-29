import * as service from '../services/contests';
import pages from '@/configs/pages';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';
import { matchPath } from 'react-router';

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
  userlist: {},
  contestUserDetail: {}, // only one user，之后再改
  ratingStatus: {},
  contest: {},
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
    setUserList(state, { payload: { data, query } }) {
      state.userlist = {
        ...data,
        _query: query,
        ...genTimeFlag(25 * 1000),
      };
    },
    setContestUser(state, { payload: { id, data } }) {
      state.contestUserDetail[id] = {
        ...data,
      };
    },
    setRatingStatus(state, { payload: { id, data } }) {
      state.ratingStatus[id] = {
        ...data,
      };
    },
    setContest(state, { payload: { id, data } }) {
      state.contest[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredContest(state) {
      state.detail = clearExpiredStateProperties(state.contest);
    },
  },
  effects: {
    *getList({ payload: query }, { call, put, select }) {
      const formattedQuery = {
        ...formatListQuery(query),
        orderBy: 'contestId',
        orderDirection: 'DESC',
      };
      const savedState = yield select((state) => state.contests.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<IContest>> = yield call(service.getList, formattedQuery);
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
    *getListData({ payload: query }, { call, put, select }) {
      const formattedQuery = {
        orderBy: 'contestId',
        orderDirection: 'DESC',
        ...formatListQuery(query),
      };
      const ret: IApiResponse<IList<IContest>> = yield call(service.getList, formattedQuery);
      return ret;
    },
    *getSession({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.contests.session[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ISession> = yield call(service.getSession, id);
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
      } else {
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
    *login({ payload: { id, data } }, { call, put }) {
      const ret: IApiResponse<ISession> = yield call(service.login, id, data);
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
    *logout({ payload: { id, clearSession = true } }, { call, put }) {
      const ret: IApiResponse<ISession> = yield call(service.logout, id);
      if (ret.success && clearSession) {
        yield put({
          type: 'clearSession',
          payload: {
            id,
          },
        });
      }
      return ret;
    },
    *getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.contests.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IContest> = yield call(service.getDetail, id);
      if (ret.success) {
        yield put({
          type: 'clearExpiredDetail',
        });
        yield put({
          type: 'setDetail',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *getProblems({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.contests.problems[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IFullList<IProblem>> = yield call(service.getProblems, id);
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
    *getProblemResultStats({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.contests.problemResultStats[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IContestProblemResultStats> = yield call(
        service.getProblemResultStats,
        id,
      );
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
    *getRanklist({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.contests.ranklist[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IFullList<IRanklistRow>> = yield call(service.getRanklist, id);
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
    *getUserList({ payload: prams }, { call, put, select }) {
      const formattedQuery = {
        ...formatListQuery(prams.query),
        orderBy: 'contestUserId',
        orderDirection: 'DESC',
      };
      const ret: IApiResponse<IList<IContest>> = yield call(
        service.getUserList,
        formattedQuery,
        prams.cid,
      );
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
    *addContestUser({ payload: { id, data } }, { call, put }) {
      const ret = yield call(service.addContestUser, id, data);
      return ret;
    },

    *getContestUser({ payload: { id, uid } }, { call, put }) {
      const ret: IApiResponse<IContestUser> = yield call(service.getContestUser, id, uid);
      if (ret.success) {
        yield put({
          type: 'setContestUser',
          payload: {
            id: uid,
            data: ret.data,
          },
        });
      }
      return ret;
    },

    *updateContestUser({ payload: { id, uid, data } }, { call, put }) {
      const ret = yield call(service.updateContestUser, id, uid, data);
      return ret;
    },

    *endContest({ payload: { id } }, { call, put }) {
      const ret = yield call(service.endContest, id);
      return ret;
    },

    *getRatingStatus({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<IContestRatingStatus> = yield call(service.getRatingStatus, id);
      if (ret.success) {
        yield put({
          type: 'setRatingStatus',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
      return ret;
    },

    *getContest({ payload: { id } }, { call, put, select }) {
      const savedState = yield select((state) => state.contests.contest[id]);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: IApiResponse<IList<IContest>> = yield call(service.getContest, id);
      if (ret.success) {
        yield put({
          type: 'clearExpiredContest',
        });
        yield put({
          type: 'setContest',
          payload: {
            id: id,
            data: ret.data.rows[0],
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
        const matchContestUserDetail = matchPath(pathname, {
          path: pages.contests.users,
          exact: true,
        });

        if (matchContestUserDetail) {
          requestEffect(dispatch, {
            type: 'getUserList',
            payload: { query, cid: matchContestUserDetail.params['id'] },
          });
          requestEffect(dispatch, {
            type: 'getContest',
            payload: { id: matchContestUserDetail.params['id'] },
          });
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
