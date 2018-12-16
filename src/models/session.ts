import * as service from '../services/session';

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
  },
  effects: {
    * fetch(action, { call, put }) {
      const ret: ApiResponse<Session> = yield call(service.fetch);
      if (ret.success) {
        yield put({
          type: 'setSession',
          payload: { user: ret.data },
        });
      }
      return ret;
    },
    * reload(action, { put }) {
      yield put({ type: 'reset' });
    },
    * getSession(action, { select }) {
      return yield select(state => state.session);
    },
    * login({ payload: data }, { call, put }) {
      return yield call(service.login, data);
    },
    * logout(action, { call, put }) {
      const ret: ApiResponse<Session> = yield call(service.logout);
      if (ret.success) {
        yield put({
          type: 'reset',
        });
      }
      return ret;
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        // if(pathname === '/session') {
        //   dispatch({ type: 'fetch' });
        // }
      });
    },
  },
};
