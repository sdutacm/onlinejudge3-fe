import * as service from '../services/contest_acm';
import pages from '@/configs/pages';

const initialState = {
  serverTime: null,
  list: {
    data: [],
    page: null,
    total: null,
    title: null,
  },
  detail: {},
  problems: {},
  problemsMap: {},
};

export default {
  state: initialState,
  reducers: {
    save(state, { payload: { item, ret } }) {
      let newState = { ...state };
      newState[item] = { ...ret };
      return newState;
    },
    saveSub(state, { payload: { item, subItem, ret } }) {
      let newState = { ...state };
      newState[item][subItem] = { ...ret };
      return newState;
    },
    saveServerTime(state, { payload: { serverTime } }) {
      return { ...state, serverTime };
    },
    reset(state, { payload: item }) {
      let newState = { ...state };
      newState[item] = { ...initialState[item] };
      return newState;
    },
  },
  effects: {
    * getList({ payload: query = { page: 1 } }, { call, put }) {
      let resp = yield call(service.getList, query);
      let ret = resp.data;
      yield put({
        type: 'save',
        payload: { item: 'list', ret },
      });
      yield put({
        type: 'saveServerTime',
        payload: { serverTime: resp.headers.date },
      });
      return ret;
    },
    * reloadList(action, { put, select }) {
      const page = yield select(state => state.contest_acm.page);
      const title = yield select(state => state.contest_acm.title);
      yield put({ type: 'fetch', payload: { page, title } });
    },
    * getDetail({ payload: { id } }, { call, put }) {
      let resp = yield call(service.getDetail, id);
      let ret = resp.data;
      yield put({
        type: 'saveSub',
        payload: { item: 'detail', subItem: id, ret },
      });
      let problemsMap = {};
      for (let prob of ret.set_problem) {
        problemsMap[prob.index] = prob.id;
      }
      yield put({
        type: 'save',
        payload: { item: 'problemsMap', ret: problemsMap },
      });
      yield put({
        type: 'saveServerTime',
        payload: { serverTime: resp.headers.date },
      });
      return ret;
    },
    * getProblem({ payload: { id, index } }, { call, put }) {
      let ret = yield call(service.getProblem, id);
      yield put({
        type: 'saveSub',
        payload: { item: 'problems', subItem: index, ret },
      });
      return ret;
    },
    * submit({ payload: data }, { call, put }) {
      return yield call(service.submit, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.contest.index) {
          dispatch({ type: 'getList', payload: query });
        }
        // let re = new RegExp(`^${pages.contest.index}/\\d+/\\w+`);

      });
    },
  },
};
