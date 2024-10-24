import * as service from '../services/session';
import { endInterception, initInterceptor, startInterception } from '@/utils/effectInterceptor';
import OJBK from '@/utils/OJBK';
import { genTimeFlag } from '@/utils/misc';
import io from 'socket.io-client';
import socketConfig from '@/configs/socket';
import { clearSocket, setSocket } from '@/utils/socket';
import { globalGeneralSocketHandler } from '@/lib/socketHandlers/general';

function genInitialState() {
  return {
    loggedIn: false,
    user: {},
    sessionList: {
      count: 0,
      rows: [],
    },
  };
}

function createGeneralSocket() {
  console.log('create general socket');
  const socket = io(socketConfig.general.url, {
    path: socketConfig.path,
    transports: ['websocket'],
    multiplex: false,
  });
  socket.on('connect', () => {
    console.log('session socket connected');
    globalGeneralSocketHandler.bindEvents(socket);
  });
  socket.on('disconnect', () => {
    console.log('session socket disconnected');
  });
  return socket;
}

export default {
  state: genInitialState(),
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
      const timeFlag = genTimeFlag(30 * 24 * 60 * 60 * 1000);
      state.loggedIn = true;
      state.user = user;
      state._t = timeFlag._t;
      state._et = timeFlag._et;
    },
    reset() {
      return genInitialState();
    },
    setSessionList(state, { payload: { data } }) {
      state.sessionList = {
        ...data,
      };
    },
    // TODO session 改变后清理掉 contestSession 以及所有登录态相关数据
  },
  effects: {
    *fetch(action, { call, put }) {
      startInterception();
      const ret: IApiResponse<ISession> = yield call(service.fetch);
      if (ret.success && ret.data) {
        yield put({
          type: 'setSession',
          payload: { user: ret.data },
        });
        yield put({
          type: 'users/getSelfAchievedAchievements',
        });
        yield put({
          type: 'messages/getUnreadList',
          payload: { userId: ret.data.userId },
        });
        yield put({
          type: 'favorites/getList',
          payload: { userId: ret.data.userId },
        });
        yield put({
          type: 'notes/getList',
          payload: { userId: ret.data.userId },
        });
        setSocket('general', createGeneralSocket());
      }
      endInterception();
      return ret;
    },
    *reload(action, { put }) {
      yield put({ type: 'reset' });
    },
    *getSession(action, { select }) {
      return yield select((state) => state.session);
    },
    *login({ payload: data }, { call, put }) {
      const ret: IApiResponse<any> = yield call(service.login, data);
      if (ret.success) {
        const userId = ret.data.userId;
        yield put({
          type: 'contests/clearAllSessions',
        });
        yield put({
          type: 'competitions/clearAllSessions',
        });
        yield put({
          type: 'competitions/clearAllSelfUserDetail',
        });
        yield put({
          type: 'users/getProblemResultStats',
          payload: { userId },
        });
        yield put({
          type: 'users/getSelfAchievedAchievements',
        });
        yield put({
          type: 'messages/getUnreadList',
          payload: { userId },
        });
        yield put({
          type: 'favorites/getList',
          payload: { userId },
        });
        yield put({
          type: 'notes/getList',
          payload: { userId },
        });
        setSocket('general', createGeneralSocket());
        OJBK.logLogin(ret.data);
      }
      return ret;
    },
    *logout(action, { call, put }) {
      const ret: IApiResponse<ISession> = yield call(service.logout);
      if (ret.success) {
        yield put({
          type: 'reset',
        });
        yield put({
          type: 'contests/clearAllSessions',
        });
        yield put({
          type: 'competitions/clearAllSessions',
        });
        yield put({
          type: 'competitions/clearAllSelfUserDetail',
        });
        yield put({
          type: 'users/clearProblemResultStats',
        });
        yield put({
          type: 'users/clearSelfAchievedAchievements',
        });
        yield put({
          type: 'messages/clearAllMessages',
        });
        yield put({
          type: 'favorites/clearAllFavorites',
        });
        yield put({
          type: 'notes/clearAllNotes',
        });
        yield put({
          type: 'groups/clearAllJoinedGroups',
        });
        clearSocket('general');
      }
      return ret;
    },
    *getSessionList({ payload }, { call, put }) {
      const ret: IApiResponse<any> = yield call(service.getSessionList);
      if (ret.success) {
        yield put({
          type: 'setSessionList',
          payload: {
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *clearSession({ payload: { sessionId } }, { call }) {
      return yield call(service.clearSession, sessionId);
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
