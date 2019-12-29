import * as service from '../services/stats';
import { genTimeFlag, isStateExpired } from '@/utils/misc';
import pages from '@/configs/pages';
import { requestEffect } from '@/utils/effectInterceptor';

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
  };
};

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
  },
  effects: {
    * getAllUserACRank({ payload: { force = false } = { force: false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.stats.userACRank);
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
