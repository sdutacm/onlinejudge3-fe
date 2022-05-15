import * as service from '../services/competitions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';
import { ICompetition } from '@/common/interfaces/competition';

function genInitialState() {
  return {
    list: {
      page: 1,
      count: 0,
      rows: [],
      _query: {},
    },
    detail: {},
  };
}

export default {
  state: genInitialState(),
  reducers: {
    setList(state, { payload: { data, query } }) {
      state.list = {
        ...data,
        _query: query,
        ...genTimeFlag(5 * 60 * 1000),
      };
    },
    setListExpired(state) {
      state.list = {
        ...state.list,
        _et: -1,
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
    *getList({ payload: query }, { call, put, select }) {
      const formattedQuery = {
        ...formatListQuery(query),
        order: [['competitionId', 'DESC']],
      };
      const savedState = yield select((state) => state.competitions.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<ICompetition>> = yield call(service.getList, formattedQuery);
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
    *getDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.competitions.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ICompetition> = yield call(service.getDetail, id);
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
    *getSignedUpCompetitionParticipant({ payload: { id } }, { call }) {
      return yield call(service.getSignedUpCompetitionParticipant, id);
    },
    *signUpCompetitionParticipant({ payload: { id, data } }, { call }) {
      return yield call(service.signUpCompetitionParticipant, id, data);
    },
    *modifySignedUpCompetitionParticipant({ payload: { id, data } }, { call }) {
      return yield call(service.modifySignedUpCompetitionParticipant, id, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.competitions.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchIntro = matchPath(pathname, {
          path: pages.competitions.public.intro,
          exact: true,
        });
        if (matchIntro) {
          requestEffect(dispatch, { type: 'getDetail', payload: { id: +matchIntro.params['id'] } });
        }
      });
    },
  },
};
