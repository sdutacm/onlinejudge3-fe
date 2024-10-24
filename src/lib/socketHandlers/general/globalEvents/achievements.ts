import { globalGeneralSocketHandler } from '..';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { showAchievementToast } from '@/components/AchievementToast';
import { reduxEmitter, ReduxEvents } from '@/events/redux';

export function bindEvents() {
  globalGeneralSocketHandler.registerEvent(
    'achievementAchieved',
    (achievementKeys: EAchievementKey[]) => {
      console.log('achievement achieved', achievementKeys);
      achievementKeys.forEach((key) => {
        showAchievementToast(key);
        reduxEmitter.emit(ReduxEvents.Dispatch, {
          type: 'users/confirmAchievementDeliveried',
          payload: {
            achievementKey: key,
          },
        });
      });
      reduxEmitter.emit(ReduxEvents.Dispatch, {
        type: 'users/getSelfAchievedAchievements',
      });
    },
  );
}
