import * as service from '../services/users';
import { matchPath } from 'react-router';
import pages from '@/configs/pages';
import { clearExpiredStateProperties, genTimeFlag, isStateExpired } from '@/utils/misc';
import { isEqual } from 'lodash-es';
import { formatListQuery } from '@/utils/format';
import { requestEffect } from '@/utils/effectInterceptor';
import { Results } from '@/configs/results';
import * as groupService from '../../groups/services/groups';
import { IGetSelfAchievedAchievementsResp, IGetSelfJoinedTeamsResp, IGetUserMembersResp, IGetSelfOfficialMembersResp } from '@/common/contracts/user';
import { EUserType } from '@/common/enums';

const initialState = {
  list: {
    page: 1,
    count: 0,
    rows: [],
    _query: {},
  },
  detail: {},
  problemResultStats: {
    acceptedProblemIds: [],
    attemptedProblemIds: [],
  },
  achievedAchievements: [],
  members: {},
  selfOfficialMembers: [],
  selfJoinedTeams: [],
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
    setDetail(state, { payload: { id, data } }) {
      state.detail[id] = {
        ...data,
        ...genTimeFlag(60 * 1000),
      };
    },
    clearExpiredDetail(state) {
      state.detail = clearExpiredStateProperties(state.detail);
    },
    reset() {
      return { ...initialState };
    },
    setProblemResultStats(state, { payload: { data, query } }) {
      state.problemResultStats = {
        ...data,
        _query: query,
        ...genTimeFlag(5 * 1000),
      };
    },
    clearProblemResultStats(state) {
      state.problemResultStats = initialState.problemResultStats;
    },
    setSelfAchievedAchievements(state, { payload: data }) {
      state.achievedAchievements = [...data];
    },
    clearSelfAchievedAchievements(state) {
      state.achievedAchievements = [];
    },
    setMembers(state, { payload: { id, data } }) {
      state.members[id] = [...data];
    },
    setSelfOfficialMembers(state, { payload: data }) {
      state.selfOfficialMembers = [...data];
    },
    clearSelfOfficialMembers(state) {
      state.selfOfficialMembers = [];
    },
    setSelfJoinedTeams(state, { payload: data }) {
      state.selfJoinedTeams = [...data];
    },
    clearSelfJoinedTeams(state) {
      state.selfJoinedTeams = [];
    },
  },
  effects: {
    *getList({ payload: query }, { call, put, select }) {
      const formattedQuery = {
        ...formatListQuery(query),
        order: [
          [
            query.orderBy || 'accepted',
            query.orderDirection ? (query.orderDirection === 'DESC' ? 'DESC' : 'ASC') : 'DESC',
          ],
        ],
      };
      delete formattedQuery.orderBy;
      delete formattedQuery.orderDirection;
      const savedState = yield select((state) => state.users.list);
      if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
        return;
      }
      const ret: IApiResponse<IList<IUser>> = yield call(service.getList, formattedQuery);
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
    *searchUser({ payload: { nickname, limit = 10 } }, { call, put, select }) {
      const query = {
        nickname,
        limit,
      };
      return yield call(service.getList, query);
    },
    *getDetail({ payload: { id, force = false } }, { all, call, put, select }) {
      if (!force) {
        const savedState = yield select((state) => state.users.detail[id]);
        if (!isStateExpired(savedState)) {
          return;
        }
      }
      const [detailRet, solutionCalendarRet, groupsRet]: IApiResponse<any>[] = yield all([
        call(service.getDetail, id),
        call(service.getSolutionCalendar, id, Results.AC),
        call(groupService.getUserGroups, id),
      ]);
      if (detailRet.success) {
        detailRet.data.solutionCalendar = (solutionCalendarRet?.data || []) as ISolutionCalendar;
        detailRet.data.groups = (groupsRet?.data?.rows || []) as IGroup[];
        yield put({
          type: 'clearExpiredDetail',
        });
        yield put({
          type: 'setDetail',
          payload: {
            id,
            data: detailRet.data,
          },
        });
        if (detailRet.data.type === EUserType.team) {
          yield put({
            type: 'getMembers',
            payload: {
              id,
            },
          });
        }
      }
      return detailRet;
    },
    *register({ payload: data }, { call, put }) {
      return yield call(service.register, data);
    },
    *forgotPassword({ payload: data }, { call, put }) {
      return yield call(service.forgotPassword, data);
    },
    *resetPasswordAndEmail({ payload: data }, { call, put }) {
      return yield call(service.resetPasswordAndEmail, data);
    },
    *getProblemResultStats(
      {
        payload: { userId, contestId, competitionId, force = false } = {
          userId: null,
          contestId: undefined,
          competitionId: undefined,
        },
      },
      { call, put, select },
    ) {
      const globalSess = yield select((state) => state.session);
      userId = userId || globalSess.user.userId;
      if (!userId) {
        return;
      }
      const formattedQuery = {
        userId,
        contestId,
      };
      if (!force) {
        const savedState = yield select((state) => state.users.problemResultStats);
        if (!isStateExpired(savedState) && isEqual(savedState._query, formattedQuery)) {
          return;
        }
      }
      const ret: IApiResponse<IUserProblemResultStats> = yield call(
        service.getProblemResultStats,
        userId,
        contestId,
        competitionId,
      );
      if (ret.success) {
        yield put({
          type: 'setProblemResultStats',
          payload: {
            data: ret.data,
            query: formattedQuery,
          },
        });
      }
      return ret;
    },
    *changePassword({ payload: { userId, data } }, { call, select }) {
      const globalSess = yield select((state) => state.session);
      userId = userId || globalSess.user.userId;
      if (!userId) {
        return;
      }
      return yield call(service.changePassword, userId, data);
    },
    *editProfile({ payload: { userId, data } }, { call, select }) {
      const globalSess = yield select((state) => state.session);
      userId = userId || globalSess.user.userId;
      if (!userId) {
        return;
      }
      return yield call(service.editProfile, userId, data);
    },
    *changeEmail({ payload: { userId, data } }, { call, select }) {
      const globalSess = yield select((state) => state.session);
      userId = userId || globalSess.user.userId;
      if (!userId) {
        return;
      }
      return yield call(service.changeEmail, userId, data);
    },
    *getSelfAchievedAchievements(_, { call, put }) {
      const ret: IApiResponse<IGetSelfAchievedAchievementsResp> = yield call(
        service.getSelfAchievedAchievements,
      );
      if (ret.success) {
        yield put({
          type: 'setSelfAchievedAchievements',
          payload: ret.data.rows,
        });
      }
      return ret;
    },
    *confirmAchievementDeliveried({ payload: { achievementKey } }, { call }) {
      return yield call(service.confirmAchievementDeliveried, achievementKey);
    },
    *receiveAchievement({ payload: { achievementKey } }, { call }) {
      return yield call(service.receiveAchievement, achievementKey);
    },
    *getMembers({ payload: { id } }, { call, put }) {
      const ret: IApiResponse<IGetUserMembersResp> = yield call(service.getUserMembers, id);
      if (ret.success) {
        yield put({
          type: 'setMembers',
          payload: {
            id,
            data: ret.data.rows,
          },
        });
      }
      return ret;
    },
    *addMember({ payload: { memberUserId } }, { call }) {
      return yield call(service.addUserMember, memberUserId);
    },
    *removeMember({ payload: { memberUserId } }, { call }) {
      return yield call(service.removeUserMember, memberUserId);
    },
    *getSelfOfficialMembers(_, { call, put }) {
      const ret: IApiResponse<IGetSelfOfficialMembersResp> = yield call(
        service.getSelfOfficialMembers,
      );
      if (ret.success) {
        yield put({
          type: 'setSelfOfficialMembers',
          payload: ret.data.rows,
        });
      }
      return ret;
    },
    *getSelfJoinedTeams(_, { call, put }) {
      const ret: IApiResponse<IGetSelfJoinedTeamsResp> = yield call(
        service.getSelfJoinedTeams,
      );
      if (ret.success) {
        yield put({
          type: 'setSelfJoinedTeams',
          payload: ret.data.rows,
        });
      }
      return ret;
    },
    *confirmJoinTeam({ payload: { teamUserId } }, { call }) {
      return yield call(service.confirmJoinTeam, teamUserId);
    },
    *confirmTeamSettlement(_, { call }) {
      return yield call(service.confirmTeamSettlement);
    },
    *getTeamData({ payload: { id } }, { call, all }) {
      const [detailRet, membersRet]: IApiResponse<any>[] = yield all([
        call(service.getDetail, id),
        call(service.getUserMembers, id),
      ]);
      return {
        detail: detailRet.data,
        members: membersRet.data || [],
      };
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === pages.users.index) {
          requestEffect(dispatch, { type: 'getList', payload: query });
        }
        const matchDetail = matchPath(pathname, {
          path: pages.users.detail,
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
