import * as service from '../services/problems';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';

const initialState = {
  list: {
    page: 1,
    count: 0,
    rows: [],
    _query: {},
  },
  detail: {},
  tagList: {
    count: 0,
    rows: [],
  }
};

export default {
  state: initialState,
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
    setTagList(state, { payload: { data } }) {
      state.tagList = {
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
      const savedState = yield select(state => state.problems.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: ApiResponse<List<IProblem> > = yield call(service.getList, formattedQuery);
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
    * getDetail({ payload: id }, { all, call, put, select }) {
      const savedState = yield select(state => state.problems.detail[id]);
      if (!isStateExpired(savedState)) {
        return;
      }
      const [detailRet, tagsRet]: ApiResponse<any>[] = yield all([
        call(service.getDetail, id),
        call(service.getProblemTags, id),
      ]);

      detailRet.data.tags = [];
      try {
        detailRet.data.tags = [ ...tagsRet.data.rows ];
      }
      catch (err) {}
      if (detailRet.success) {
        yield put({
          type: 'setDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
        yield put({
          type: 'clearExpiredDetail',
        });
      }
      return detailRet;
    },
    * getTagList(action, { call, put, select }) {
      const savedState = yield select(state => state.problems.tagList);
      if (!isStateExpired(savedState)) {
        return;
      }
      const ret: ApiResponse<FullList<ITag> > = yield call(service.getTagList);
      if (ret.success) {
        yield put({
          type: 'setTagList',
          payload: { data: ret.data },
        });
      }
      return ret;
    },
    // * reloadList(action, { put, select }) {
    //   const page = yield select(state => state.problems.query.page);
    //   const title = yield select(state => state.problems.query.title);
    //   yield put({ type: 'getList', payload: { page, title } });
    // },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.problems.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
          requestEffect(dispatch, { type: 'getTagList' });
          requestEffect(dispatch, { type: 'users/getProblemResultStats' });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.problems.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, { type: 'getDetail', payload: matchDetail.params['id'] });
        }
      });
    },
  },
};
