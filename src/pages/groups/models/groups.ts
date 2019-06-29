import * as service from '../services/groups';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { formatListQuery } from '@/utils/format';
import { isEqual } from 'lodash';
import pages from '@/configs/pages';
import { requestEffect } from '@/utils/effectInterceptor';
import { matchPath } from 'react-router';

const initialState = {
  list: {
    count: 0,
    rows: [],
    _query: {},
  },
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { data, query } }) {
      state.list = {
        ...data,
        ...genTimeFlag(60 * 1000),
        _query: query,
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
  },
  effects: {
    * getList({ payload: query }, { call, put, select }) {
      const formattedQuery = formatListQuery(query);
      const savedState = yield select(state => state.groups.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<IGroup> > = yield call(service.getList, formattedQuery);
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
        const savedState = yield select(state => state.groups.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IGroup> = yield call(service.getDetail, id);
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
    * addGroup({ payload: data }, { call }) {
      return yield call(service.addGroup, data);
    },
    * addGroupMember({ payload: { id, userIds } }, { call }) {
      return yield call(service.addGroupMember, id, userIds);
    },
    * deleteGroupMember({ payload: { id, userIds } }, { call }) {
      return yield call(service.deleteGroupMember, id, userIds);
    },
    * updateGroupMember({ payload: { id, userId, data } }, { call }) {
      return yield call(service.updateGroupMember, id, userId, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.groups.index) {
          requestEffect(dispatch, { type: 'getList', payload: { query } });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.groups.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, { type: 'getDetail', payload: { id: matchDetail.params['id'] } });
        }
      });
    },
  },
};
