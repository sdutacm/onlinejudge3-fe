import * as service from '../services/sets';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';

function genInitialState() {
  return {
    list: {
      page: 1,
      count: 0,
      rows: [],
      _query: {},
    },
    detail: {},
  };
}

export default {
  state: genInitialState(),
  reducers: {
    setList(state, { payload: { data, query } }) {
      state.list = {
        ...data,
        _query: query,
        ...genTimeFlag(5 * 60 * 1000),
      };
    },
    clearList(state) {
      state.list = genInitialState()['list'];
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearDetail(state, { payload: { id } }) {
      delete state.detail[id];
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
  },
  effects: {
    *getList({ payload: query }, { call, put, select }) {
      const formattedQuery = formatListQuery(query);
      const savedState = yield select((state) => state.sets.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<ISet>> = yield call(service.getList, formattedQuery);
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
    *getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.sets.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ISet> = yield call(service.getDetail, id);
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
    *addSet({ payload: { data } }, { call }) {
      return yield call(service.addSet, data);
    },
    *updateSet({ payload: { id, data } }, { call }) {
      return yield call(service.updateSet, id, data);
    },
    *deleteSet({ payload: { id } }, { call }) {
      return yield call(service.deleteSet, id);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.sets.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.sets.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, { type: 'getDetail', payload: { id: matchDetail.params['id'] } });
          requestEffect(dispatch, { type: 'users/getProblemResultStats' });
        }
      });
    },
  },
};
