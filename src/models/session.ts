import * as service from '../services/session';
import { endInterception, initInterceptor, startInterception } from '@/utils/effectInterceptor';

const initialState = {
  loggedIn: false,
  user: {},
};

export default {
  state: initialState,
  reducers: {
    // save(state, { payload: { item, ret } }) {
    //   let newState = { ...state };
    //   newState[item] = { ...ret };
    //   console.log(state, newState);
    //   return newState;
    // },
    // reset(state, { payload: item }) {
    //   let newState = { ...state };
    //   newState[item] = { ...initialState[item] };
    //   return newState;
    // },
    setSession(state, { payload: { user } }) {
      state.loggedIn = true;
      state.user = user;
    },
    reset() {
      return { ...initialState };
    },
    // TODO session 改变后清理掉 contestSession 以及所有登录态相关数据
  },
  effects: {
    * fetch(action, { call, put }) {
      startInterception();
      const ret: ApiResponse<ISession> = yield call(service.fetch);
      if (ret.success) {
        yield put({
          type: 'setSession',
          payload: { user: ret.data },
        });
      }
      endInterception();
      return ret;
    },
    * reload(action, { put }) {
      yield put({ type: 'reset' });
    },
    * getSession(action, { select }) {
      return yield select(state => state.session);
    },
    * login({ payload: data }, { call, put }) {
      const ret: ApiResponse<any> = yield call(service.login, data);
      if (ret.success) {
        const userId = ret.data.userId;
        yield put({
          type: 'users/getProblemResultStats',
          payload: { userId },
        });
      }
      return ret;
    },
    * logout(action, { call, put }) {
      const ret: ApiResponse<ISession> = yield call(service.logout);
      if (ret.success) {
        yield put({
          type: 'reset',
        });
        yield put({
          type: 'contests/clearAllSessions',
        });
        yield put({
          type: 'users/clearProblemResultStats',
        });
      }
      return ret;
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      initInterceptor();
      return history.listen(({ pathname }) => {
        // if(pathname === '/session') {
        //   dispatch({ type: 'fetch' });
        // }
      });
    },
  },
};
