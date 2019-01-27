import * as service from '../services/messages';
import { genTimeFlag, isStateExpired } from '@/utils/misc';
import { formatListQuery } from '@/utils/format';
import { isEqual } from 'lodash';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { requestEffect } from '@/utils/effectInterceptor';

const initialState = {
  unread: {
    page: 1,
    count: 0,
    rows: [],
    _query: {},
  },
  received: {
    page: 1,
    count: 0,
    rows: [],
    _query: {},
  },
  sent: {
    page: 1,
    count: 0,
    rows: [],
    _query: {},
  },
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { source, data, query } }) {
      state[source] = {
        ...data,
        ...genTimeFlag(60 * 1000),
        _query: query,
      };
    },
    updateList(state, { payload: { source, data } }) {
      state[source] = {
        ...data,
      };
    },
    clearAllMessages(state) {
      state.unread = initialState.unread;
      state.received = initialState.received;
      state.sent = initialState.sent;
    },
  },
  effects: {
    * getUnreadList({ payload: { userId } }, { call, put, select }) {
      const savedState = yield select(state => state.messages.unread);
      if (!isStateExpired(savedState)) {
        return;
      }
      if (!userId) {
        const session = yield select(state => state.session);
        if (!session.loggedIn) {
          return;
        }
        userId = session.user.userId;
      }
      const query = {
        toUserId: userId,
        read: false,
      };
      const formattedQuery = {
        ...formatListQuery(query),
        orderBy: 'messageId',
        orderDirection: 'DESC',
        limit: limits.messages.unread,
      };
      const ret: IApiResponse<IList<IMessage>> = yield call(service.getList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: {
            source: 'unread',
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    * getReceivedList({ payload: { userId, query } }, { call, put, select }) {
      if (!userId) {
        const session = yield select(state => state.session);
        if (!session.loggedIn) {
          return;
        }
        userId = session.user.userId;
      }
      const formattedQuery = {
        ...formatListQuery(query),
        toUserId: userId,
        orderBy: 'messageId',
        orderDirection: 'DESC',
        limit: limits.messages.list,
      };
      const savedState = yield select(state => state.messages.received);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<IMessage>> = yield call(service.getList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: {
            source: 'received',
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    * getSentList({ payload: { userId, query } }, { call, put, select }) {
      if (!userId) {
        const session = yield select(state => state.session);
        if (!session.loggedIn) {
          return;
        }
        userId = session.user.userId;
      }
      const formattedQuery = {
        ...formatListQuery(query),
        fromUserId: userId,
        orderBy: 'messageId',
        orderDirection: 'DESC',
        limit: limits.messages.list,
      };
      const savedState = yield select(state => state.messages.sent);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<IMessage>> = yield call(service.getList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: {
            source: 'sent',
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    * markRead({ payload: { id, read } }, { call, put, select }) {
      const ret: IApiResponse<any> = yield call(service.markRead, id, read);
      if (ret.success && read) { // 如果有 mark as unread 要再加相应逻辑
        const unreadList: IList<IMessage> = yield select(state => state.messages.unread);
        const newUnreadRows = unreadList.rows.filter(m => m.messageId !== id);
        yield put({
          type: 'updateList',
          payload: {
            source: 'unread',
            data: {
              ...unreadList,
              count: newUnreadRows.length,
              rows: newUnreadRows,
            },
          },
        });

        const receivedList: IList<IMessage> = yield select(state => state.messages.received);
        const newReceivedRows = receivedList.rows.map(m => {
          if (m.messageId !== id) {
            return m;
          }
          return {
            ...m,
            read,
          };
        });
        yield put({
          type: 'updateList',
          payload: {
            source: 'received',
            data: {
              ...receivedList,
              rows: newReceivedRows,
            },
          },
        });
      }
      return ret;
    },
    * send({ payload: data }, { call, put }) {
      return yield call(service.send, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.messages.index) {
          if (query.type === 'received') {
            const q = { ...query };
            delete q.type;
            requestEffect(dispatch, { type: 'getReceivedList', payload: { query: q } });
          }
          else if (query.type === 'sent') {
            const q = { ...query };
            delete q.type;
            requestEffect(dispatch, { type: 'getSentList', payload: { query: q } });
          }
        }
      });
    },
  },
};
