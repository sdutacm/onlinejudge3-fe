import * as service from '../services/groups';
import {
  clearExpiredStateProperties,
  genTimeFlag,
  isStateExpired,
} from '@/utils/misc';
import { formatListQuery } from '@/utils/format';
import { isEqual } from 'lodash';
import pages from '@/configs/pages';
import { requestEffect } from '@/utils/effectInterceptor';
import { matchPath } from 'react-router';
import limits from '@/configs/limits';

function genInitialState() {
  return {
    search: {
      count: 0,
      rows: [],
      _query: {},
    },
    detail: {},
    members: {},
  };
}

export default {
  state: genInitialState(),
  reducers: {
    setSearch(state, { payload: { data, query } }) {
      state.search = {
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
    setMembers(state, { payload: { id, data } }) {
      state.members[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredMembers(state) {
      state.members = clearExpiredStateProperties(state.members);
    },
  },
  effects: {
    *searchList({ payload: query }, { call, put, select }) {
      const formattedQuery = formatListQuery(query);
      formattedQuery.limit = +query.limit || limits.groups.search;
      delete formattedQuery.category;
      const savedState = yield select((state) => state.groups.search);
      if (
        !isStateExpired(savedState) &&
        isEqual(savedState._query, formattedQuery)
      ) {
        return;
      }
      const ret: IApiResponse<IList<IGroup>> = yield call(
        service.getList,
        formattedQuery,
      );
      if (ret.success) {
        yield put({
          type: 'setSearch',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.groups.detail[id]);
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
    *getMembers({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.groups.members[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IGroup> = yield call(service.getMembers, id);
      if (ret.success) {
        yield put({
          type: 'clearExpiredMembers',
        });
        yield put({
          type: 'setMembers',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *addGroup({ payload: data }, { call }) {
      return yield call(service.addGroup, data);
    },
    *updateGroup({ payload: { id, data } }, { call }) {
      return yield call(service.updateGroup, id, data);
    },
    *deleteGroup({ payload: { id } }, { call }) {
      return yield call(service.deleteGroup, id);
    },
    *addGroupMember({ payload: { id, data } }, { call }) {
      return yield call(service.addGroupMember, id, data);
    },
    *joinGroup({ payload: { id } }, { call }) {
      return yield call(service.addGroupMember, id);
    },
    *updateGroupMember({ payload: { id, userId, data } }, { call }) {
      return yield call(service.updateGroupMember, id, userId, data);
    },
    *deleteGroupMember({ payload: { id, userId } }, { call }) {
      return yield call(service.deleteGroupMember, id, userId);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.groups.index && query.category !== 'my' && query.name) {
          requestEffect(dispatch, { type: 'searchList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.groups.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, {
            type: 'getDetail',
            payload: { id: matchDetail.params['id'] },
          });
          requestEffect(dispatch, {
            type: 'getMembers',
            payload: { id: matchDetail.params['id'] },
          });
        }
      });
    },
  },
};
