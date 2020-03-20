import * as service from '../services/stats';
import { genTimeFlag, isStateExpired } from '@/utils/misc';
import pages from '@/configs/pages';
import { requestEffect } from '@/utils/effectInterceptor';
import { isEqual } from 'lodash';

function genInitialState() {
  return {
    userACRank: {
      day: {
        count: 0,
        rows: [],
        truncated: 0,
        startAt: '',
        _updateEvery: -1,
        _updatedAt: -1,
      },
      week: {
        count: 0,
        rows: [],
        truncated: 0,
        startAt: '',
        _updateEvery: -1,
        _updatedAt: -1,
      },
      month: {
        count: 0,
        rows: [],
        truncated: 0,
        startAt: '',
        _updateEvery: -1,
        _updatedAt: -1,
      },
    },
    uasp: {
      stats: {},
      truncated: 0,
      _updateEvery: 0,
      _updatedAt: 0,
      _query: {},
    },
  };
}

export default {
  state: genInitialState(),
  reducers: {
    setUserACRank(state, { payload: { type, data } }) {
      state.userACRank = {
        ...state.userACRank,
        [type]: data,
        ...genTimeFlag(5 * 60 * 1000),
      };
    },
    clearAllUserACRank(state) {
      state.userACRank = genInitialState().userACRank;
    },
    setUASP(state, { payload: { data, query } }) {
      state.uasp = {
        ...data,
        ...genTimeFlag(5 * 60 * 1000),
        _query: query,
      };
    },
    clearAllUASP(state) {
      state.uasp = genInitialState().uasp;
    },
  },
  effects: {
    *getAllUserACRank({ payload: { force = false } = { force: false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.stats.userACRank);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const dayRet: IApiResponse<IStatsUserACRank> = yield call(service.getUserACRank, 'day');
      const weekRet: IApiResponse<IStatsUserACRank> = yield call(service.getUserACRank, 'week');
      const monthRet: IApiResponse<IStatsUserACRank> = yield call(service.getUserACRank, 'month');
      if (dayRet.success) {
        yield put({
          type: 'setUserACRank',
          payload: {
            type: 'day',
            data: dayRet.data,
          },
        });
      }
      if (weekRet.success) {
        yield put({
          type: 'setUserACRank',
          payload: {
            type: 'week',
            data: weekRet.data,
          },
        });
      }
      if (monthRet.success) {
        yield put({
          type: 'setUserACRank',
          payload: {
            type: 'month',
            data: monthRet.data,
          },
        });
      }
      return {
        day: dayRet,
        week: weekRet,
        month: monthRet,
      };
    },
    *getUASP(
      { payload: { userIds, includeSubmitted = false, force = false } },
      { call, put, select },
    ) {
      const query = {
        userIds,
        includeSubmitted,
      };
      if (!force) {
        const savedState = yield select((state) => state.stats.userAcceptedProblems);
        if (!isStateExpired(savedState) && isEqual(savedState._query, query)) {
          return {
            success: true,
            code: 0,
            data: savedState,
          };
        }
      }
      if (!Array.isArray(userIds) || userIds.length === 0) {
        const data = genInitialState().uasp;
        yield put({
          type: 'setUASP',
          payload: {
            data,
            query,
          },
        });
        return {
          success: true,
          code: 0,
          data,
        };
      }
      let data: IStatsUASP;
      let ret: IApiResponse;
      if (includeSubmitted) {
        ret = yield call(service.getUserSubmittedProblems, userIds) as IApiResponse<
          IStatsUserSubmittedProblems
        >;
        if (ret.success) {
          data = ret.data;
          for (const _userId of Object.keys(data.stats)) {
            const userId = +_userId;
            const d = data.stats[userId];
            for (const p of d.problems) {
              const lastSolution = p.s.length ? p.s[p.s.length - 1] : undefined;
              if (lastSolution?.res === 1) {
                p.sid = lastSolution.sid;
                p.at = lastSolution.at;
              }
            }
          }
        }
      } else {
        ret = yield call(service.getUserAcceptedProblems, userIds) as IApiResponse<
          IStatsUserAcceptedProblems
        >;
        if (ret.success) {
          data = ret.data;
        }
      }
      if (data) {
        yield put({
          type: 'setUASP',
          payload: {
            data,
            query,
          },
        });
      }
      return ret;
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.index) {
          requestEffect(dispatch, { type: 'getAllUserACRank', payload: {} });
        }
      });
    },
  },
};
