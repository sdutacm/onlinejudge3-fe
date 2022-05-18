import * as service from '../services/competitions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';
import { ICompetition } from '@/common/interfaces/competition';
import { ECompetitionUserRole } from '@/common/enums';

function genInitialState() {
  return {
    list: {
      page: 1,
      count: 0,
      rows: [],
      _query: {},
    },
    detail: {},
    session: {},
    users: {},
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
    setSession(state, { payload: { id, data } }) {
      state.session[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearSession(state, { payload: { id } }) {
      state.session[id] = {
        loggedIn: false,
        user: {},
      };
    },
    clearAllSessions(state) {
      state.session = {};
    },
    clearExpiredSession(state) {
      state.session = clearExpiredStateProperties(state.session);
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
    setUsers(state, { payload: { id, data } }) {
      state.users[id] = {
        ...data,
      };
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
    *getSession({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.competitions.session[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ISession> = yield call(service.getSession, id);
      if (ret.success && ret.data) {
        yield put({
          type: 'setSession',
          payload: {
            id,
            data: {
              loggedIn: true,
              user: ret.data,
            },
          },
        });
        yield put({
          type: 'clearExpiredSession',
        });
      } else {
        yield put({
          type: 'setSession',
          payload: {
            id,
            data: {
              loggedIn: false,
              user: {},
              _code: ret.code,
            },
          },
        });
      }
      return ret;
    },
    *login({ payload: { id, data } }, { call, put }) {
      const ret: IApiResponse<ISession> = yield call(service.login, id, data);
      if (ret.success) {
        yield put({
          type: 'setSession',
          payload: {
            id,
            data: ret.data,
          },
        });
        yield put({
          type: 'clearExpiredSession',
        });
      }
      return ret;
    },
    *logout({ payload: { id, clearSession = true } }, { call, put }) {
      const ret: IApiResponse<ISession> = yield call(service.logout, id);
      if (ret.success && clearSession) {
        yield put({
          type: 'clearSession',
          payload: {
            id,
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
    *getAllCompetitionUsers({ payload: { id } }, { call, put }) {
      const ret: IApiResponse = yield call(service.getCompetitionUsers, id);
      if (ret.success) {
        yield put({
          type: 'setUsers',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
    },
    *getCompetitionUsers({ payload: { id, query } }, { call }) {
      return yield call(service.getCompetitionUsers, id, query);
    },
    *getPublicCompetitionParticipants({ payload: { id } }, { call }) {
      return yield call(service.getPublicCompetitionParticipants, id);
    },
    *getPublicCompetitionParticipantDetail({ payload: { id, userId } }, { call }) {
      return yield call(service.getPublicCompetitionParticipantDetail, id, userId);
    },
    *auditCompetitionParticipant({ payload: { id, userId, data } }, { call }) {
      return yield call(service.auditCompetitionParticipant, id, userId, data);
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.competitions.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchPublicIntro = matchPath(pathname, {
          path: pages.competitions.public.intro,
          exact: true,
        });
        if (matchPublicIntro) {
          requestEffect(dispatch, {
            type: 'getDetail',
            payload: { id: +matchPublicIntro.params['id'] },
          });
        }
      });
    },
  },
};
