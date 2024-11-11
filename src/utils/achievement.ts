import { EAchievementKey } from '@/common/configs/achievement.config';
import AchievementConfig from '@/common/configs/achievement-config.json';

export function getAchievementByKey(key: EAchievementKey) {
  for (const category of AchievementConfig) {
    for (const achievement of category.achievements) {
      if (achievement.achievementKey === key) {
        return achievement;
      }
    }
  }
}
