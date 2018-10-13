import * as service from '../services/problems';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';

const initialState = {
  list: {
    page: 1,
    total: 0,
    rows: [],
  },
  one: {},
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
      const ret: ApiResponse<List<Problem> > = yield call(service.getList, query);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: { data: ret.data },
        });
      }
      return ret;
    },
    * getOne({ payload: id }, { call, put }) {
      const ret: ApiResponse<Problem> = yield call(service.getOne, id);
      if (ret.success) {
        yield put({
          type: 'setOne',
          payload: { data: ret.data },
        });
      }
      return ret;
    }
    // * reloadList(action, { put, select }) {
    //   const page = yield select(state => state.problems.query.page);
    //   const title = yield select(state => state.problems.query.title);
    //   yield put({ type: 'getList', payload: { page, title } });
    // },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.problems.index) {
          dispatch({ type: 'getList', payload: query });
        }
        const matchOne = matchPath(pathname, {
          path: pages.problems.one,
          exact: true,
        });
        if (matchOne) {
          dispatch({ type: 'getOne', payload: matchOne.params['id'] });
        }
      });
    },
  },
};
