import * as service from '../services/users';
import { matchPath } from 'react-router';
import pages from '@/configs/pages';
import { genTimeFlag, isStateExpired } from '@/utils/misc';

const initialState = {
  list: {
    page: 1,
    count: 0,
    rows: [],
  },
  detail: {},
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { data } }) {
      state.list = data;
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = { ...data, ...genTimeFlag(20000) };
    },
    reset() {
      return { ...initialState };
    },
  },
  effects: {
    * getList({ payload: query = { page: 1 } }, { call, put }) {
      const ret: ApiResponse<List<User> > = yield call(service.getList, query);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: { data: ret.data },
        });
      }
      return ret;
    },
    * getDetail({ payload: id }, { call, put, select }) {
      const savedState = yield select(state => state.users.detail[id]);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: ApiResponse<User> = yield call(service.getDetail, id);
      if (ret.success) {
        yield put({
          type: 'setDetail',
          payload: { id, data: ret.data },
        });
      }
      return ret;
    },
    * register({ payload: data }, { call, put }) {
      return yield call(service.register, data);
    },
    * forgotPassword({ payload: data }, { call, put }) {
      return yield call(service.forgotPassword, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.users.index) {
          dispatch({ type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.users.detail,
          exact: true,
        });
        if (matchDetail) {
          dispatch({ type: 'getDetail', payload: matchDetail.params['id'] });
        }
      });
    },
  },
};
