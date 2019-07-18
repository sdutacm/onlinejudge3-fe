import * as service from '../services/topics';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';

function getInitialState() {
  return {
    list: {
      page: 1,
      count: 0,
      rows: [],
      _query: {},
    },
    detail: {},
    topicReplies: {
      page: 1,
      count: 0,
      rows: [],
      _topicId: 0,
    },
  };
}

export default {
  state: getInitialState(),
  reducers: {
    setList(state, { payload: { data, query } }) {
      state.list = {
        ...data,
        _query: query,
        ...genTimeFlag(5 * 60 * 1000),
      };
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
    setTopicReplies(state, { payload: { id, data } }) {
      state.topicReplies = {
        ...data,
        _topicId: id,
      };
    },
    clearTopicReplies(state) {
      state.topicReplies = getInitialState().topicReplies;
    },
  },
  effects: {
    * getList({ payload: query }, { call, put, select }) {
      const formattedQuery = {
        ...formatListQuery(query),
        orderBy: 'topicId',
        orderDirection: 'DESC',
      };
      const savedState = yield select(state => state.topics.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<ITopic> > = yield call(service.getList, formattedQuery);
      if (ret.success) {
        yield put({
          type: 'setList',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    * getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select(state => state.topics.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ITopic> = yield call(service.getDetail, id);
      if (ret.success) {
        yield put({
          type: 'clearExpiredDetail',
        });
        yield put({
          type: 'setDetail',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
      return ret;
    },
    * getTopicReplies({ payload: { id, query = {} as any, getLast = false } }, { call, put, select }) {
      const savedState = yield select(state => state.topics.topicReplies);
      if (id !== savedState._topicId) {
        yield put({
          type: 'clearTopicReplies',
        });
      }
      const formattedQuery = !getLast ? {
        ...formatListQuery(query),
        orderBy: 'replyId',
        orderDirection: query.orderDirection || 'ASC',
      } : {
        page: 1,
        orderBy: 'replyId',
        orderDirection: 'DESC',
      };
      const ret: IApiResponse<IList<IReply> > = yield call(service.getTopicReplies, id, formattedQuery);
      if (ret.success) {
        let rows = [...ret.data.rows];
        const { limit, count } = ret.data;
        if (getLast) {
          const realCount = count % limit === 0 ? count : count % limit;
          rows = rows.slice(0, realCount);
          rows.reverse();
        }
        yield put({
          type: 'setTopicReplies',
          payload: {
            id,
            data: {
              ...ret.data,
              page: !getLast ? ret.data.page : Math.floor(Math.max(ret.data.count - 1, 0) / ret.data.limit) + 1,
              rows,
            },
          },
        });
      }
      return ret;
    },
    * addTopic({ payload: { data } }, { call }) {
      return yield call(service.addTopicReply, data);
    },
    * addReply({ payload: { id, data } }, { call }) {
      return yield call(service.addTopicReply, id, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.topics.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.topics.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, { type: 'getDetail', payload: { id: +matchDetail.params['id'] } });
          requestEffect(dispatch, { type: 'getTopicReplies', payload: { id: +matchDetail.params['id'], query } });
        }
      });
    },
  },
};
