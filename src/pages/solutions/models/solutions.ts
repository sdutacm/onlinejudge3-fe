import * as service from '../services/solutions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash-es';
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
  languageConfig: [],
};

export default {
  state: initialState,
  reducers: {
    setList(state, { payload: { data, query } }) {
      state.list = {
        ...data,
        _query: query,
        ...genTimeFlag(60 * 1000),
      };
    },
    updateList(state, { payload: { data } }) {
      state.list = {
        ...state.list,
        ...data,
      };
    },
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 1000),
      };
    },
    updateDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...state.detail[id],
        ...data,
      };
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
    setLanguageConfig(state, { payload: { data } }) {
      state.languageConfig = data;
    },
  },
  effects: {
    *getList({ payload: query }, { call, put, select }) {
      const formattedQuery = formatListQuery(query);
      delete formattedQuery.page;
      if (formattedQuery.lt) {
        formattedQuery.lt = +formattedQuery.lt;
      }
      if (formattedQuery.gt) {
        formattedQuery.gt = +formattedQuery.gt;
      }
      formattedQuery.solutionId && (formattedQuery.solutionId = +formattedQuery.solutionId);
      formattedQuery.userId && (formattedQuery.userId = +formattedQuery.userId);
      formattedQuery.problemId && (formattedQuery.problemId = +formattedQuery.problemId);
      formattedQuery.result && (formattedQuery.result = +formattedQuery.result);
      delete formattedQuery.from;
      const savedState = yield select((state) => state.solutions.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IIdPaginationList<ISolution>> = yield call(
        service.getList,
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
    *getListByIds({ payload }, { call, put, select }) {
      const { type, solutionIds } = payload;
      switch (type) {
        case 'list': {
          const ret: IApiResponse<IList<ISolution>> = yield call(service.getListByIds, {
            solutionIds,
          });
          if (ret.success) {
            const map: Record<number, ISolution> = {};
            (ret.data?.rows || []).forEach((solution) => {
              map[solution.solutionId] = solution;
            });
            const state = yield select();
            let hasChange = false;
            const list: IList<ISolution> = state.solutions.list;
            const rows = list.rows.map((row) => {
              if (map[row.solutionId]) {
                hasChange = true;
                return map[row.solutionId];
              }
              return row;
            });
            hasChange &&
              (yield put({
                type: 'updateList',
                payload: {
                  data: {
                    ...list,
                    rows,
                  },
                },
              }));
          }
          return ret;
        }
        case 'detail': {
          const solutionId = solutionIds[0];
          const ret: IApiResponse<ISolution> = yield call(service.getDetail, solutionId);
          if (ret.success) {
            yield put({
              type: 'updateDetail',
              payload: {
                id: solutionId,
                data: ret.data,
              },
            });
            return {
              page: 1,
              limit: 1,
              count: 1,
              rows: [ret.data],
            };
          }
          return ret;
        }
      }
    },
    *getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.solutions.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ISolution> = yield call(service.getDetail, id);
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
    *getDetailForCompilationInfo({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<ISolution> = yield call(service.getDetail, id);
      if (ret.success) {
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
    *submit({ payload: data }, { call, put }) {
      return yield call(service.submit, data);
    },
    *changeShared({ payload: { id, shared } }, { call, put }) {
      const ret: IApiResponse<any> = yield call(service.changeShared, id, shared);
      if (ret.success) {
        yield put({
          type: 'updateDetail',
          payload: {
            id,
            data: { shared },
          },
        });
      }
      return ret;
    },
    *getLanguageConfig({ payload: { force = false } }, { call, put, select }) {
      // if (!force) {
      //   const savedState = yield select((state) => state.solutions.languageConfig);
      //   if (!isStateExpired(savedState)) {
      //     return;
      //   }
      // }
      const ret: IApiResponse<IJudgerLanguageConfigItem[]> = yield call(service.getLanguageConfig);
      if (ret.success) {
        yield put({
          type: 'setLanguageConfig',
          payload: {
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *rejudgeSolution({ payload: data }, { call }) {
      return yield call(service.rejudgeSolution, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.solutions.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.solutions.detail,
          exact: true,
        });
        if (matchDetail) {
          requestEffect(dispatch, {
            type: 'getDetail',
            payload: { id: +matchDetail.params['id'] },
          });
        }
      });
    },
  },
};
