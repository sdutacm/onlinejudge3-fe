import * as service from '../services/messages';
import { genTimeFlag, isStateExpired } from '@/utils/misc';
import { formatListQuery } from '@/utils/format';
import { isEqual } from 'lodash';
import limits from '@/configs/limits';

const initialState = {
  unread: {
    page: 1,
    count: 0,
    rows: [],
  },
  received: {
    page: 1,
    count: 0,
    rows: [],
  },
  sent: {
    page: 1,
    count: 0,
    rows: [],
  },
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { source, data } }) {
      state[source] = {
        ...data,
        ...genTimeFlag(60 * 1000),
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
      const ret: IApiResponse<IList<IMessage> > = yield call(service.getList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: {
            source: 'unread',
            data: ret.data,
          },
        });
      }
      return ret;
    },
    * markRead({ payload: { id, read } }, { call, put, select }) {
     const ret: IApiResponse<any> = yield call(service.markRead, id, read);
     if (ret.success && read) { // 如果有 mark as unread 要再加相应逻辑
       const unreadList: IList<IMessage> = yield select(state => state.messages.unread);
       const newRows = unreadList.rows.filter(m => m.messageId !== id);
       yield put({
         type: 'updateList',
         payload: {
           source: 'unread',
           data: {
             ...unreadList,
             count: newRows.length,
             rows: newRows,
           },
         },
       });
     }
     return ret;
    },
  },
};
