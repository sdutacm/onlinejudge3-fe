import { globalGeneralSocketHandler } from '..';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { showAchievementToast } from '@/components/AchievementToast';
import { reduxEmitter, ReduxEvents } from '@/events/redux';

export function bindEvents() {
  globalGeneralSocketHandler.registerEvent(
    'achievementCompleted',
    (achievementKeys: EAchievementKey[]) => {
      console.log('achievement completed', achievementKeys);
      achievementKeys.forEach((key) => {
        showAchievementToast(key);
        reduxEmitter.emit(ReduxEvents.Dispatch, {
          type: 'users/getSelfCompletedAchievements',
        })
      });
    },
  );
}
