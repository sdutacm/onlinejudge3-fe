import * as service from '../services/competitions';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash-es';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';
import {
  ICompetition,
  ICompetitionSettings,
  ICompetitionUser,
} from '@/common/interfaces/competition';
import { IGetCompetitionSpGenshinExplorationUnlockRecordsResp } from '@/common/contracts/competition';

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
    notifications: {},
    questions: {},
    ranklist: {},
    ratingStatus: {},
    spGenshinUnlockedSectionIds: {},
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
    setNotifications(state, { payload: { id, data } }) {
      state.notifications[id] = {
        ...data,
        ...genTimeFlag(30 * 1000),
      };
    },
    clearExpiredNotifications(state) {
      state.notifications = clearExpiredStateProperties(state.notifications);
    },
    setQuestions(state, { payload: { id, data } }) {
      state.questions[id] = {
        ...data,
        ...genTimeFlag(30 * 1000),
      };
    },
    clearExpiredQuestions(state) {
      state.questions = clearExpiredStateProperties(state.questions);
    },
    setRanklist(state, { payload: { id, data } }) {
      state.ranklist[id] = {
        ...data,
        ...genTimeFlag(25 * 1000),
      };
    },
    clearExpiredRanklist(state) {
      state.ranklist = clearExpiredStateProperties(state.ranklist);
    },
    setRatingStatus(state, { payload: { id, data } }) {
      state.ratingStatus[id] = {
        ...data,
      };
    },
    setSpGenshinUnlockedSectionIds(state, { payload: { id, data } }) {
      state.spGenshinUnlockedSectionIds[id] = [...data];
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
    *getListData({ payload: query }, { call }) {
      const formattedQuery: IListQuery = {
        order: [['competitionId', 'DESC']],
        ...formatListQuery(query),
      };
      const ret: IApiResponse<IList<ICompetition>> = yield call(service.getList, formattedQuery);
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
    *deleteSignedUpCompetitionParticipant({ payload: { id } }, { call }) {
      return yield call(service.deleteSignedUpCompetitionParticipant, id);
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
    *getCompetitionBalloons({ payload: { id } }, { call }) {
      return yield call(service.getCompetitionBalloons, id);
    },
    *updateCompetitionBalloonStatus({ payload: { id, balloonId, data } }, { call }) {
      return yield call(service.updateCompetitionBalloonStatus, id, balloonId, data);
    },
    *getNotifications({ payload: { id, force = false, auto = false } }, { call, put, select }) {
      const savedState = yield select((state) => state.competitions.notifications[id]);
      if (!force && !auto) {
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse = yield call(service.getCompetitionNotifications, id);
      if (ret.success) {
        yield put({
          type: 'setNotifications',
          payload: {
            id,
            data: {
              // @ts-ignore
              ...ret.data,
              rows: ret.data!.rows.reverse(),
            },
          },
        });
        yield put({
          type: 'clearExpiredNotifications',
        });
        const prevCount = savedState?.rows?.length || 0;
        if (auto && savedState && ret.data!.rows.length > prevCount) {
          alert(
            `Received new notifications from judges!\nPlease go to "Overview" page to check them.`,
          );
        }
      }
      return ret;
    },
    *createCompetitionNotification({ payload: { id, data } }, { call }) {
      return yield call(service.createCompetitionNotification, id, data);
    },
    *deleteCompetitionNotification({ payload: { id, competitionNotificationId } }, { call }) {
      return yield call(service.deleteCompetitionNotification, id, competitionNotificationId);
    },
    *getQuestions({ payload: { id, force = false, auto = false } }, { call, put, select }) {
      const savedState = yield select((state) => state.competitions.questions[id]);
      if (!force && !auto) {
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const ret: IApiResponse = yield call(service.getSelfCompetitionQuestions, id);
      if (ret.success) {
        yield put({
          type: 'setQuestions',
          payload: {
            id,
            data: {
              // @ts-ignore
              ...ret.data,
              rows: ret.data!.rows.reverse(),
            },
          },
        });
        yield put({
          type: 'clearExpiredQuestions',
        });
        if (auto && savedState) {
          const prevCount = (savedState?.rows || []).filter((r) => !!r.reply).length;
          const nextCount = (ret.data!.rows || []).filter((r) => !!r.reply).length;
          if (nextCount > prevCount) {
            alert(
              `Received new question reples from judges!\nPlease go to "Overview" page to check them.`,
            );
          }
        }
      }
      return ret;
    },
    *getAllQuestions({ payload: { id } }, { call }) {
      const ret: IApiResponse = yield call(service.getCompetitionQuestions, id);
      if (ret.success) {
        // @ts-ignore
        ret.data.rows.reverse();
      }
      return ret;
    },
    *createCompetitionQuestion({ payload: { id, data } }, { call }) {
      return yield call(service.createCompetitionQuestion, id, data);
    },
    *replyCompetitionQuestion({ payload: { id, competitionQuestionId, data } }, { call }) {
      return yield call(service.replyCompetitionQuestion, id, competitionQuestionId, data);
    },
    *getRanklist({ payload: { id, god, force = false } }, { call, put, select }) {
      // if (!force) {
      //   const savedState = yield select((state) => state.contests.ranklist[id]);
      //   if (!isStateExpired(savedState)) {
      //     return;
      //   }
      // }
      const ret: IApiResponse<IFullList<IRanklistRow>> = yield call(
        service.getCompetitionRanklist,
        id,
        god,
      );
      if (ret.success) {
        // 应先 clear，防止 set 时间过长导致又被 clear 掉
        yield put({
          type: 'clearExpiredRanklist',
        });
        yield put({
          type: 'setRanklist',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *getRatingStatus({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<ICompetitionRatingStatus> = yield call(service.getRatingStatus, id);
      if (ret.success) {
        yield put({
          type: 'setRatingStatus',
          payload: {
            id,
            data: ret.data,
          },
        });
      }
      return ret;
    },
    *endCompetition({ payload: { id } }, { call, put }) {
      const ret = yield call(service.endCompetition, id);
      return ret;
    },
    *cancelEndCompetition({ payload: { id } }, { call, put }) {
      const ret = yield call(service.cancelEndCompetition, id);
      return ret;
    },
    *getSpGenshinUnlockedSectionIds({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<IGetCompetitionSpGenshinExplorationUnlockRecordsResp> = yield call(
        service.getSpGenshinExplorationUnlockRecords,
        id,
      );
      if (ret.success) {
        yield put({
          type: 'setSpGenshinUnlockedSectionIds',
          payload: {
            id,
            data: (ret.data.records || []).map((r) => r.sectionId),
          },
        });
      }
      return ret;
    },
    *doCompetitionSpGenshinExplorationUnlock({ payload: { id, sectionId } }, { call, put }) {
      const ret = yield call(service.doCompetitionSpGenshinExplorationUnlock, id, sectionId);
      return ret;
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
          requestEffect(dispatch, {
            type: 'getSettings',
            payload: { id: +matchPublicIntro.params['id'] },
          });
        }

        const matchPublicParticipants = matchPath(pathname, {
          path: pages.competitions.public.participants,
          exact: true,
        });
        if (matchPublicParticipants) {
          requestEffect(dispatch, {
            type: 'getDetail',
            payload: { id: +matchPublicParticipants.params['id'] },
          });
        }

        const matchOverview = matchPath(pathname, {
          path: pages.competitions.overview,
          exact: true,
        });
        if (matchOverview) {
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

        const matchProblemDetail = matchPath(pathname, {
          path: pages.competitions.problemDetail,
          exact: true,
        });
        if (matchProblemDetail) {
          requestEffect(dispatch, {
            type: 'getProblems',
            payload: { id: +matchProblemDetail.params['id'] },
          });
        }

        const matchSolutions = matchPath(pathname, {
          path: pages.competitions.solutions,
          exact: true,
        });
        if (matchSolutions) {
          requestEffect(dispatch, {
            type: 'getProblems',
            payload: { id: +matchSolutions.params['id'] },
          });
        }

        const matchSolutionDetail = matchPath(pathname, {
          path: pages.competitions.solutionDetail,
          exact: true,
        });
        if (matchSolutionDetail) {
          requestEffect(dispatch, {
            type: 'getProblems',
            payload: { id: +matchSolutionDetail.params['id'] },
          });
        }

        const matchRanklist = matchPath(pathname, {
          path: pages.competitions.ranklist,
          exact: true,
        });
        if (matchRanklist) {
          requestEffect(dispatch, {
            type: 'getProblems',
            payload: { id: +matchRanklist.params['id'] },
          });
        }

        const matchNotificationManagement = matchPath(pathname, {
          path: pages.competitions.notificationManagement,
          exact: true,
        });
        if (matchNotificationManagement) {
          requestEffect(dispatch, {
            type: 'getNotifications',
            payload: { id: +matchNotificationManagement.params['id'] },
          });
        }

        const matchQuestionManagement = matchPath(pathname, {
          path: pages.competitions.qa,
          exact: true,
        });
        if (matchQuestionManagement) {
          requestEffect(dispatch, {
            type: 'getAllQuestions',
            payload: { id: +matchQuestionManagement.params['id'] },
          });
        }
      });
    },
  },
};
