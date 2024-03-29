import * as service from '../services/favorites';
import { genTimeFlag, isStateExpired } from '@/utils/misc';
import { formatListQuery } from '@/utils/format';
import { isEqual } from 'lodash-es';
import pages from '@/configs/pages';
import { requestEffect } from '@/utils/effectInterceptor';
import { Codes } from '@/common/codes';

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
    updateList(state, { payload: { data } }) {
      state.list = {
        ...data,
      };
    },
    clearAllFavorites(state) {
      state.list = initialState.list;
    },
  },
  effects: {
    *getList(
      {
        payload: { userId, query = {}, force = false } = { userId: null, query: {}, force: false },
      },
      { call, put, select },
    ) {
      if (!userId) {
        const session = yield select((state) => state.session);
        if (!session.loggedIn) {
          return {
            success: false,
            code: Codes.GENERAL_NOT_LOGGED_IN,
          };
        }
        userId = session.user.userId;
      }
      const formattedQuery = {
        order: [['favoriteId', 'DESC']],
        ...formatListQuery(query, true),
        // limit: limits.favorites.list,
      };
      if (!force) {
        const savedState = yield select((state) => state.favorites.list);
        if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
          return {
            success: true,
            code: 0,
            data: savedState,
          };
        }
      }
      const ret: IApiResponse<IFullList<IFavorite>> = yield call(
        service.getList,
        userId,
        formattedQuery,
      );
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
    *addFavorite({ payload: data }, { call }) {
      return yield call(service.addFavorite, data);
    },
    *deleteFavorite({ payload: { id } }, { call }) {
      return yield call(service.deleteFavorite, id);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.favorites.index) {
          if (query.type === 'problem') {
            requestEffect(dispatch, { type: 'getList', payload: { query } });
          }
        }
      });
    },
  },
};
