import * as service from '../services/solutions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
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
    updateList(state, { payload: { data } }) {
      state.list = {
        ...state.list,
        ...data,
      };
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 1000),
      };
    },
    updateDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...state.detail[id],
        ...data,
      };
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
  },
  effects: {
    * getList({ payload: query }, { call, put, select }) {
      const formattedQuery = formatListQuery(query);
      const savedState = yield select(state => state.solutions.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: ApiResponse<List<Solution> > = yield call(service.getList, formattedQuery);
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
    * getListByIds({ payload }, { call, put, select }) {
      const { type, solutionIds } = payload;
      const ret: ApiResponse<List<Solution> > = yield call(service.getListByIds, { solutionIds });
      if (ret.success) {
        const state = yield select();
        if (type === 'list') {
          let hasChange = false;
          const list: List<Solution> = state.solutions.list;
          const rows = list.rows.map(row => {
            if (ret.data[row.solutionId]) {
              hasChange = true;
              return ret.data[row.solutionId];
            }
            return row
          });
          hasChange && (yield put({
            type: 'updateList',
            payload: {
              data: {
                ...list,
                rows: rows,
              },
            },
          }));
        }
        else if (type === 'detail') {
          const solutionId = solutionIds[0];
          ret.data && ret.data[solutionId] && (yield put({
            type: 'updateDetail',
            payload: { id: solutionId, data: ret.data[solutionId] },
          }));
        }
      }
      return ret;
    },
    * getDetail({ payload: id }, { call, put, select }) {
      const savedState = yield select(state => state.solutions.detail[id]);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: ApiResponse<Solution> = yield call(service.getDetail, id);
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
    * submit({ payload: data }, { call, put }) {
      return yield call(service.submit, data);
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.solutions.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.solutions.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, { type: 'getDetail', payload: matchDetail.params['id'] });
        }
      });
    },
  },
};
