import * as service from '../services/solutions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';

const initialState = {
  list: {
    page: 1,
    total: 0,
    rows: [],
  },
  one: null,
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { data } }) {
      state.list = data;
    },
    setOne(state, { payload: { data } }) {
      state.one = data;
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
    * getOne({ payload: id }, { call, put }) {
      const ret: ApiResponse<Solution> = yield call(service.getOne, id);
      if (ret.success) {
        yield put({
          type: 'setOne',
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
        const matchOne = matchPath(pathname, {
          path: pages.solutions.one,
          exact: true,
        });
        if (matchOne) {
          dispatch({ type: 'getOne', payload: matchOne.params['id'] });
        }
      });
    },
  },
};
