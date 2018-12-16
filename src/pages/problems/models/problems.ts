import * as service from '../services/problems';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
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
    * getDetail({ payload: id }, { call, put, select }) {
      const savedState = yield select(state => state.problems.detail[id]);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: ApiResponse<Problem> = yield call(service.getDetail, id);
      if (ret.success) {
        yield put({
          type: 'setDetail',
          payload: { id, data: ret.data },
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
        const matchDetail = matchPath(pathname, {
          path: pages.problems.detail,
          exact: true,
        });
        if (matchDetail) {
          dispatch({ type: 'getDetail', payload: matchDetail.params['id'] });
        }
      });
    },
  },
};
