import React from 'react';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import { Icon } from 'antd';
import { IAchievement } from '@/common/interfaces/achievement';
import { EAchievementKey } from '@/common/configs/achievement.config';
import { getAchievementByKey } from '@/utils/achievement';
import AchievementTrophySvg from '@/assets/svg/achievement-trophy.svg';
import { EAchievementLevel } from '@/common/enums';

export interface IAchievementToastProps {
  achievement: IAchievement;
}

class AchievementToast extends React.Component<IAchievementToastProps> {
  render() {
    const { achievement } = this.props;

    return (
      <div className="achievement-toast">
        <div
          className={classNames(
            'achievement-toast-trophy',
            `achievement-toast-trophy-${EAchievementLevel[achievement.level]}`,
          )}
        >
          <Icon theme="outlined" component={AchievementTrophySvg} />
        </div>
        <div className="achievement-toast-info">
          <div className="achievement-toast-title text-ellipsis">
            {achievement.title}
          </div>
          <div className="achievement-toast-description text-ellipsis">
            {achievement.description}
          </div>
        </div>
      </div>
    );
  }
}

export default AchievementToast;

export function showAchievementToast(achievementKey: EAchievementKey) {
  const achievement = getAchievementByKey(achievementKey);
  return toast(<AchievementToast achievement={achievement} />, { containerId: 'achievement' });
}
