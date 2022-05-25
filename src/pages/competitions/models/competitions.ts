import * as service from '../services/competitions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';
import {
  ICompetition,
  ICompetitionSettings,
  ICompetitionUser,
} from '@/common/interfaces/competition';
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
    settings: {},
    problems: {},
    problemResultStats: {},
    problemConfig: {},
    session: {},
    selfUserDetail: {},
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
    setSelfUserDetail(state, { payload: { id, data } }) {
      state.selfUserDetail[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearSelfUserDetail(state, { payload: { id } }) {
      state.selfUserDetail[id] = undefined;
    },
    clearAllSelfUserDetail(state) {
      state.selfUserDetail = {};
    },
    clearExpiredSelfUserDetail(state) {
      state.selfUserDetail = clearExpiredStateProperties(state.selfUserDetail);
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
    setSettings(state, { payload: { id, data } }) {
      state.settings[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredSettings(state) {
      state.settings = clearExpiredStateProperties(state.settings);
    },
    setProblems(state, { payload: { id, data } }) {
      state.problems[id] = {
        ...data,
        ...genTimeFlag(60 * 60 * 1000),
      };
    },
    clearExpiredProblems(state) {
      state.problems = clearExpiredStateProperties(state.problems);
    },
    setProblemResultStats(state, { payload: { id, data } }) {
      state.problemResultStats[id] = {
        ...data,
        ...genTimeFlag(25 * 1000),
      };
    },
    clearExpiredProblemResultStats(state) {
      state.problemResultStats = clearExpiredStateProperties(state.problemResultStats);
    },
    setProblemConfig(state, { payload: { id, data } }) {
      state.problemConfig[id] = data;
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
        const selfUserDetailRet: IApiResponse<ICompetitionUser> = yield call(
          service.getSelfUserDetail,
          id,
        );
        if (selfUserDetailRet.success && selfUserDetailRet.data) {
          yield put({
            type: 'setSelfUserDetail',
            payload: {
              id,
              data: selfUserDetailRet.data,
            },
          });
          yield put({
            type: 'clearExpiredSelfUserDetail',
          });
        }
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
    *getSelfUserDetail({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.competitions.selfUserDetail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ICompetitionUser> = yield call(service.getSelfUserDetail, id);
      if (ret.success && ret.data) {
        yield put({
          type: 'setSelfUserDetail',
          payload: {
            id,
            data: ret.data,
          },
        });
        yield put({
          type: 'clearExpiredSelfUserDetail',
        });
      } else {
        yield put({
          type: 'setSelfUserDetail',
          payload: {
            id,
            data: undefined,
          },
        });
      }
      return ret;
    },
    *login({ payload: { id, data } }, { call, put }) {
      const ret: IApiResponse<ISession> = yield call(service.login, id, data);
      if (ret.success) {
        // const selfUserDetailRet: IApiResponse<ICompetitionUser> = yield call(service.getSelfUserDetail, id);
        // if (selfUserDetailRet.success && selfUserDetailRet.data) {
        //   yield put({
        //     type: 'setSelfUserDetail',
        //     payload: {
        //       id,
        //       data: selfUserDetailRet.data,
        //     },
        //   });
        //   yield put({
        //     type: 'clearExpiredSelfUserDetail',
        //   });
        // }
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
        yield put({
          type: 'clearSelfUserDetail',
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
    *updateCompetitionDetail({ payload: { id, data } }, { call }) {
      return yield call(service.updateCompetitionDetail, id, data);
    },
    *getSettings({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.competitions.settings[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<ICompetitionSettings> = yield call(service.getSettings, id);
      if (ret.success) {
        yield put({
          type: 'clearExpiredSettings',
        });
        yield put({
          type: 'setSettings',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *updateSettings({ payload: { id, data } }, { call }) {
      return yield call(service.updateSettings, id, data);
    },
    *getProblems({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.competitions.problems[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IFullList<IProblem>> = yield call(service.getProblems, id);
      if (ret.success) {
        yield put({
          type: 'setProblems',
          payload: {
            id,
            data: ret.data,
          },
        });
        yield put({
          type: 'clearExpiredProblems',
        });
      }
      return ret;
    },
    *getProblemResultStats({ payload: { id, force = false } }, { call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.competitions.problemResultStats[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse<IContestProblemResultStats> = yield call(
        service.getProblemResultStats,
        id,
      );
      if (ret.success) {
        yield put({
          type: 'setProblemResultStats',
          payload: {
            id,
            data: ret.data,
          },
        });
        yield put({
          type: 'clearExpiredProblemResultStats',
        });
      }
      return ret;
    },
    *getCompetitionProblemConfig({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<any> = yield call(service.getProblemConfig, id);
      if (ret.success) {
        yield put({
          type: 'setProblemConfig',
          payload: {
            id,
            data: ret.data.rows,
          },
        });
      }
      return ret;
    },
    *setCompetitionProblemConfig({ payload: { id, data } }, { call }) {
      return yield call(service.setProblemConfig, id, data);
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
      return ret;
    },
    *batchCreateCompetitionUsers({ payload: { id, data } }, { call }) {
      return yield call(service.batchCreateCompetitionUsers, id, data);
    },
    *createCompetitionUser({ payload: { id, userId, data } }, { call }) {
      return yield call(service.createCompetitionUser, id, userId, data);
    },
    *updateCompetitionUser({ payload: { id, userId, data } }, { call }) {
      return yield call(service.updateCompetitionUser, id, userId, data);
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
    *confirmEnter({ payload: { id } }, { call }) {
      return yield call(service.confirmEnter, id);
    },
    *confirmQuit({ payload: { id } }, { call }) {
      return yield call(service.confirmQuit, id);
    },
    *randomAllCompetitionUserPasswords({ payload: { id } }, { call }) {
      return yield call(service.randomAllCompetitionUserPasswords, id);
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
        const matchUserManagement = matchPath(pathname, {
          path: pages.competitions.userManagement,
          exact: true,
        });
        if (matchUserManagement) {
          requestEffect(dispatch, {
            type: 'getAllCompetitionUsers',
            payload: { id: +matchUserManagement.params['id'] },
          });
        }
        const matchProblemSettings = matchPath(pathname, {
          path: pages.competitions.problemSettings,
          exact: true,
        });
        if (matchProblemSettings) {
          requestEffect(dispatch, {
            type: 'getCompetitionProblemConfig',
            payload: { id: +matchProblemSettings.params['id'] },
          });
        }
      });
    },
  },
};
