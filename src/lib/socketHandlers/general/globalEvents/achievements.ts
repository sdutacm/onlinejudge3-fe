import { globalGeneralSocketHandler } from '..';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { showAchievementToast } from '@/components/AchievementToast';
import { reduxEmitter, ReduxEvents } from '@/events/redux';
import { sleep } from '@/utils/misc';

export function bindEvents() {
  globalGeneralSocketHandler.registerEvent(
    'achievementAchieved',
    async (achievementKeys: EAchievementKey[]) => {
      console.log('achievement achieved', achievementKeys);
      reduxEmitter.emit(ReduxEvents.Dispatch, {
        type: 'users/getSelfAchievedAchievements',
      });
      reduxEmitter.emit(ReduxEvents.Dispatch, {
        type: 'achievements/getStats',
      });
      for (const key of achievementKeys) {
        showAchievementToast(key);
        reduxEmitter.emit(ReduxEvents.Dispatch, {
          type: 'users/confirmAchievementDeliveried',
          payload: {
            achievementKey: key,
          },
        });
        await sleep(200);
      }
    },
  );
}
