import md5 from 'md5';
import * as service from '../services/achievements';
import achievementConfig from '@/common/configs/achievement-config.json';
import { IGetAchievementRateResp } from '@/common/contracts/achievement';

export default {
  state: {
    stats: [],
  },
  reducers: {
    setStats(state, { payload: data }) {
      state.stats = { ...data };
    },
  },
  effects: {
    *getStats(_, { call, put }) {
      const ret: IApiResponse<IGetAchievementRateResp> = yield call(service.getAchievementRate);
      if (ret.success) {
        const flatenAchievements = achievementConfig.reduce((acc, cate) => {
          return acc.concat(cate.achievements);
        }, []);
        const statsMap: Record<
          string,
          {
            count: number;
            rate: number;
          }
        > = {};
        flatenAchievements.forEach((achievement) => {
          const hashKey = md5(`achievementKey:${achievement.achievementKey}`);
          const data = ret.data.rows.find((row) => row.hashKey === hashKey);
          statsMap[achievement.achievementKey] = {
            count: data?.count || 0,
            rate: data?.rate || 0,
          };
        });

        yield put({
          type: 'setStats',
          payload: statsMap,
        });
      }
    },
    *requestAchievementPush(_, { call }) {
      return yield call(service.requestAchievementPush);
    },
  },
};
