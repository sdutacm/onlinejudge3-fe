import React from 'react';
import { connect } from 'dva';
import { Modal, Icon } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import tracker from '@/utils/tracker';
import { withRouter } from 'react-router';
import { IAchievementCategory } from '@/common/interfaces/achievement';
import achievementConfig from '@/common/configs/achievement-config.json';
import moment from 'moment';
import classNames from 'classnames';
import { EAchievementLevel } from '@/common/enums';
import AchievementTrophySvg from '@/assets/svg/achievement-trophy.svg';

const achievementLevels = [
  EAchievementLevel.gold,
  EAchievementLevel.silver,
  EAchievementLevel.bronze,
];

export interface Props extends ReduxProps, RouteProps {
  completedAchievements: {
    achievementKey: string;
    createdAt: string;
  }[];
  onClickShowModal?: React.MouseEventHandler;
}

interface State {
  visible: boolean;
  selectedCategory: string;
}

class AchievementsModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectedCategory: achievementConfig[0].categoryKey,
    };
  }

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
    this.props.onClickShowModal && this.props.onClickShowModal(e);
    tracker.event({
      category: 'component.NavMenu',
      action: 'showAchievements',
    });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  handleSelectCategory = (category: IAchievementCategory) => {
    this.setState({ selectedCategory: category.categoryKey });
  };

  render() {
    const { children, completedAchievements, location } = this.props;
    const { selectedCategory } = this.state;
    const currentCategoryAchievements =
      achievementConfig.find((c) => c.categoryKey === selectedCategory)?.achievements || [];
    const currentCategoryCompletedAchievements = currentCategoryAchievements.filter((a) =>
      completedAchievements.some((ca) => a.achievementKey === ca.achievementKey),
    );
    const currentCategoryUncompletedAchievements = currentCategoryAchievements.filter(
      (a) => !currentCategoryCompletedAchievements.includes(a),
    );
    const shownAchievements = currentCategoryCompletedAchievements.concat(
      currentCategoryUncompletedAchievements,
    );
    const allCompletedAchievements = achievementConfig
      .map((c) => c.achievements)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter((a) => completedAchievements.some((ca) => a.achievementKey === ca.achievementKey));
    const completedCountPerLevel = [1, 2, 3].map(
      (level) => allCompletedAchievements.filter((a) => a.level === level).length,
    );

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Achievements"
          visible={this.state.visible}
          onOk={this.handleHideModel}
          onCancel={this.handleHideModel}
          footer={null}
          width={720}
          bodyStyle={{ padding: '0' }}
        >
          <div className="achievement-panel">
            <div className="achievement-panel-main">
              <div className="achievement-category-container">
                <ul className="achievement-category-list">
                  {achievementConfig.map((category) => (
                    <li
                      key={category.categoryKey}
                      className={classNames('achievement-category-item', {
                        active: selectedCategory === category.categoryKey,
                      })}
                      onClick={() => this.handleSelectCategory(category)}
                    >
                      <span className="achievement-category-item-title">{category.title}</span>
                      <span className="achievement-category-item-secondary">
                        已达成{' '}
                        {
                          category.achievements.filter((achievement) =>
                            completedAchievements.find(
                              (ca) => ca.achievementKey === achievement.achievementKey,
                            ),
                          ).length
                        }
                        /{category.achievements.length}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="achievement-list-container">
                <ul className="achievement-list">
                  {shownAchievements.map((achievement) => {
                    const completedAchievement = completedAchievements.find(
                      (ca) => ca.achievementKey === achievement.achievementKey,
                    );
                    const shouldHide = achievement.hidden && !completedAchievement;
                    return (
                      <li
                        key={achievement.achievementKey}
                        className={classNames('achievement-list-item', {
                          'achievement-list-item-uncompleted': !completedAchievement,
                        })}
                      >
                        <div
                          className={classNames(
                            'achievement-list-item-trophy',
                            `achievement-list-item-trophy-${EAchievementLevel[achievement.level]}`,
                          )}
                        >
                          <Icon theme="outlined" component={AchievementTrophySvg} />
                        </div>
                        <div className="achievement-list-item-info">
                          <div className="achievement-list-item-title text-ellipsis">
                            {shouldHide ? '???' : achievement.title}
                          </div>
                          <div className="achievement-list-item-description text-ellipsis">
                            {shouldHide ? '' : achievement.description}
                          </div>
                          <div className="achievement-list-item-annotation text-ellipsis">
                            {shouldHide ? '' : achievement.annotation}
                          </div>
                        </div>
                        <div className="achievement-list-item-status">
                          {completedAchievement ? (
                            <div  className="achievement-list-item-status-group">
                              <div className="achievement-list-item-status-text nowrap">已达成</div>
                              <div className="achievement-list-item-status-date nowrap">
                                {moment(completedAchievement.createdAt).format('YYYY-MM-DD')}
                              </div>
                            </div>
                          ) : (
                            <div className="achievement-list-item-status-text uncompleted nowrap">未达成</div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="achievement-panel-footer">
              <div className="achievement-statistics-count">
                <span>
                  总计达成{' '}
                  <span className="achievement-statistics-count-value">
                    {allCompletedAchievements.length}
                  </span>
                </span>
              </div>
              <div className="achievement-statistics-divider" />
              <div className="achievement-statistics-trophy-board">
                {achievementLevels.map((level, index) => (
                  <div key={level} className="achievement-statistics-trophy">
                    <div
                      className={classNames(
                        'achievement-statistics-trophy-icon',
                        `achievement-statistics-trophy-icon-${EAchievementLevel[level]}`,
                      )}
                    >
                      <Icon theme="outlined" component={AchievementTrophySvg} />
                    </div>
                    <div className="achievement-statistics-trophy-count">
                      {completedCountPerLevel[index]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    completedAchievements: state.users.completedAchievements,
  };
}

export default connect(mapStateToProps)(withRouter(AchievementsModal));
