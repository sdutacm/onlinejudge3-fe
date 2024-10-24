import React from 'react';
import { connect } from 'dva';
import { Modal, Icon, Button, Badge } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import tracker from '@/utils/tracker';
import { withRouter } from 'react-router';
import { IAchievementCategory } from '@/common/interfaces/achievement';
import achievementConfig from '@/common/configs/achievement-config.json';
import moment from 'moment';
import classNames from 'classnames';
import { EAchievementLevel, EUserAchievementStatus } from '@/common/enums';
import AchievementTrophySvg from '@/assets/svg/achievement-trophy.svg';
import msg from '@/utils/msg';
import { Howl } from 'howler';

const achievementLevels = [
  EAchievementLevel.gold,
  EAchievementLevel.silver,
  EAchievementLevel.bronze,
];

export interface Props extends ReduxProps, RouteProps {
  achievedAchievements: {
    achievementKey: string;
    status: EUserAchievementStatus;
    createdAt: string;
  }[];
  receiveLoading: boolean;
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

  handleReceiveAchievement = (achievementKey: string) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'users/receiveAchievement',
      payload: {
        achievementKey,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        dispatch({
          type: 'users/getSelfAchievedAchievements',
        });
        tracker.event({
          category: 'users',
          action: 'receiveAchievement',
        });
        const sound = new Howl({
          src: [`${process.env.PUBLIC_PATH}assets/audio/achievement-receive.mp3`],
        });
        sound.play();
      }
    });
  };

  render() {
    const { children, achievedAchievements, receiveLoading } = this.props;
    const { selectedCategory } = this.state;
    const currentCategoryAchievements = (
      achievementConfig.find((c) => c.categoryKey === selectedCategory)?.achievements || []
    ).map((a) => ({
      ...a,
      status: achievedAchievements.find((ca) => ca.achievementKey === a.achievementKey)?.status,
    }));
    const currentCategoryAchievedAchievements = currentCategoryAchievements.filter(
      (a) => a.status !== undefined,
    );
    const currentCategoryUnreadAchievements = currentCategoryAchievedAchievements.filter(
      (a) => a.status !== EUserAchievementStatus.received,
    );
    const currentCategoryReadAchievements = currentCategoryAchievedAchievements.filter(
      (a) => a.status === EUserAchievementStatus.received,
    );
    const currentCategoryUnachievedAchievements = currentCategoryAchievements.filter(
      (a) =>
        !currentCategoryAchievedAchievements.some((ca) => ca.achievementKey === a.achievementKey),
    );
    const shownAchievements = [
      ...currentCategoryUnreadAchievements,
      ...currentCategoryReadAchievements,
      ...currentCategoryUnachievedAchievements,
    ];
    const allAchievedAchievements = achievementConfig
      .map((c) => c.achievements)
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter((a) => achievedAchievements.some((ca) => a.achievementKey === ca.achievementKey));
    const achievedCountPerLevel = [1, 2, 3].map(
      (level) => allAchievedAchievements.filter((a) => a.level === level).length,
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
                  {achievementConfig.map((category) => {
                    const achievedAchievementsInCategory = category.achievements
                      .filter((achievement) =>
                        this.props.achievedAchievements.find(
                          (ca) => ca.achievementKey === achievement.achievementKey,
                        ),
                      )
                      .map((achievement) => {
                        const a = this.props.achievedAchievements.find(
                          (ca) => ca.achievementKey === achievement.achievementKey,
                        );
                        return {
                          ...achievement,
                          status: a.status,
                        };
                      });
                    const hasUnread = achievedAchievementsInCategory.some(
                      (ca) => ca.status !== EUserAchievementStatus.received,
                    );

                    return (
                      <li
                        key={category.categoryKey}
                        className={classNames('achievement-category-item', {
                          active: selectedCategory === category.categoryKey,
                        })}
                        onClick={() => this.handleSelectCategory(category)}
                      >
                        <span className="achievement-category-item-title">
                          {category.title}
                          {hasUnread && <Badge status="error" className="ml-md" />}
                        </span>
                        <span className="achievement-category-item-secondary">
                          {achievedAchievementsInCategory.length}/{category.achievements.length}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="achievement-list-container">
                <ul className="achievement-list">
                  {shownAchievements.map((achievement) => {
                    const achievedAchievement = achievedAchievements.find(
                      (ca) => ca.achievementKey === achievement.achievementKey,
                    );
                    const shouldHide = achievement.hidden && !achievedAchievement;
                    const unread =
                      achievedAchievement &&
                      achievedAchievement.status !== EUserAchievementStatus.received;
                    return (
                      <li
                        key={achievement.achievementKey}
                        className={classNames('achievement-list-item', {
                          'achievement-list-item-unachieved': !achievedAchievement,
                        })}
                      >
                        <div
                          className={classNames(
                            'achievement-list-item-trophy',
                            `achievement-list-item-trophy-${
                              shouldHide ? 'unknown' : EAchievementLevel[achievement.level]
                            }`,
                          )}
                        >
                          {!shouldHide && <Icon theme="outlined" component={AchievementTrophySvg} />}
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
                          {achievedAchievement ? (
                            unread ? (
                              <div className="achievement-list-item-status-action">
                                <Button
                                  type="primary"
                                  size="small"
                                  loading={receiveLoading}
                                  onClick={() => {
                                    this.handleReceiveAchievement(achievement.achievementKey);
                                  }}
                                >
                                  Receive
                                </Button>
                              </div>
                            ) : (
                              <div className="achievement-list-item-status-group">
                                <div className="achievement-list-item-status-text nowrap">
                                  Achieved
                                </div>
                                <div className="achievement-list-item-status-date nowrap">
                                  {moment(achievedAchievement.createdAt).format('YYYY-MM-DD')}
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="achievement-list-item-status-text unachieved nowrap">
                              Unachieved
                            </div>
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
                  Total Achieved{' '}
                  <span className="achievement-statistics-count-value">
                    {allAchievedAchievements.length}
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
                      {achievedCountPerLevel[index]}
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
    achievedAchievements: state.users.achievedAchievements,
    receiveLoading: !!state.loading.effects['users/receiveAchievement'],
  };
}

export default connect(mapStateToProps)(withRouter(AchievementsModal));
