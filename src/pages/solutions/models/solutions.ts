import * as service from '../services/solutions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';

const initialState = {
  list: {
    page: 1,
    count: 0,
    rows: [],
  },
  detail: null,
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { data } }) {
      state.list = data;
    },
    setDetail(state, { payload: { data } }) {
      state.detail = data;
    },
  },
  effects: {
    * getList({ payload: query = { page: 1 } }, { call, put }) {
      const ret: ApiResponse<List<Solution> > = yield call(service.getList, query);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: { data: ret.data },
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
            type: 'setList',
            payload: {
              data: {
                ...list,
                rows: rows,
              },
            },
          }));
        }
        else if(type === 'detail') {
          const detail: Solution = state.solutions.detail;
          ret.data[detail.solutionId] && (yield put({
            type: 'setDetail',
            payload: { data: ret.data[detail.solutionId] },
          }));
        }
      }
      return ret;
    },
    * getDetail({ payload: id }, { call, put }) {
      const ret: ApiResponse<Solution> = yield call(service.getDetail, id);
      if (ret.success) {
        yield put({
          type: 'setDetail',
          payload: { data: ret.data },
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
          dispatch({ type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.solutions.detail,
          exact: true,
        });
        if (matchDetail) {
          dispatch({ type: 'getDetail', payload: matchDetail.params['id'] });
        }
      });
    },
  },
};
