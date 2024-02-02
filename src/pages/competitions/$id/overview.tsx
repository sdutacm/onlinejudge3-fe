import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Table, Button, Alert, Popover } from 'antd';
import { ReduxProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import { filterXSS as xss } from 'xss';
import { numberToAlphabet, secToTimeStr, toLongTs, urlf } from '@/utils/format';
import moment from 'moment';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import TimeStatusBadge from '@/components/TimeStatusBadge';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Countdown from '@/components/Countdown';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import SolutionResultStats from '@/components/SolutionResultStats';
import PageAnimation from '@/components/PageAnimation';
import {
  ICompetition,
  ICompetitionUser,
  ICompetitionNotification,
  ICompetitionQuestion,
  ICompetitionSpConfigGenhinExplorationW2KByDistributePeriodically,
} from '@/common/interfaces/competition';
import { ECompetitionUserRole, ECompetitionUserStatus } from '@/common/enums';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import GeneralFormModal from '@/components/GeneralFormModal';
import Explanation from '@/components/Explanation';
import {
  getReadableVarScoreExpression,
  getReadableVarScoreExpressionZh,
} from '@/utils/competition';
import { compileVarScoreExpression } from '@/common/utils/competition';
import GenshinModal from '@/components/GenshinModal';
import GenshinDivider from '@/components/GenshinDivider';
import GenshinButton from '@/components/GenshinButton';
import { getSpGenshinExplorationKeyInfo } from '@/common/utils/competition-genshin';
import { competitionEmitter, CompetitionEvents } from '@/events/competition';
import ProblemTitle from '@/components/ProblemTitle';

export interface Props extends ReduxProps {
  id: number;
  session: ICompetitionSessionStatus;
  selfUserDetail: ICompetitionUser;
  detailLoading: boolean;
  detail: ICompetition;
  problemsLoading: boolean;
  problems: IFullList<ICompetitionProblem>;
  competitionProblemResultStats: ICompetitionProblemResultStats;
  notifications: ICompetitionNotification[];
  notificationsLoading: boolean;
  questions: ICompetitionQuestion[];
  questionsLoading: boolean;
  spGenshinUnlockedSectionIds: string[];
  spGenshinUnlockedSectionIdsLoading: boolean;
  spGenshinLoading: boolean;
  confirmEnterLoading: boolean;
  confirmQuitLoading: boolean;
  endCompetitionLoading: boolean;
  doCompetitionSpGenshinExplorationUnlockLoading: boolean;
}

interface State {
  genshinTryUnlockModalVisible: boolean;
  genshinTryUnlockModalInfo: {
    selectedSectionId: string;
    canUnlock: boolean;
    keyCost: number;
  };
  nextSecond: number;
}

class CompetitionOverview extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};
  private _keyInfoRefreshTimer: number;

  constructor(props) {
    super(props);
    this.state = {
      genshinTryUnlockModalVisible: false,
      genshinTryUnlockModalInfo: {
        selectedSectionId: '',
        canUnlock: false,
        keyCost: 999,
      },
      nextSecond: 0,
    };
  }

  get isGenshin() {
    return this.props?.detail?.spConfig?.preset === 'genshin';
  }

  get acceptedProblemIndexes(): number[] {
    const { competitionProblemResultStats, problems } = this.props;
    const indexes: number[] = [];
    for (let i = 0; i < problems.rows.length; i++) {
      const stats = competitionProblemResultStats[problems.rows[i].problemId];
      if (stats?.selfAccepted) {
        indexes.push(i);
      }
    }
    return indexes;
  }

  get keyInfo() {
    const { detail, spGenshinUnlockedSectionIds } = this.props;

    const competition = {
      spConfig: detail?.spConfig || {},
    };
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const elapsedTimeSecond = Math.floor((currentTime - startTime) / 1000);

    return getSpGenshinExplorationKeyInfo(
      competition,
      elapsedTimeSecond,
      this.acceptedProblemIndexes,
      spGenshinUnlockedSectionIds,
    );
  }

  get currentKeyNum() {
    return this.keyInfo.current;
  }

  checkDetail = (detail: ICompetition) => {
    const { id, session, dispatch } = this.props;
    if (!detail) {
      return;
    }
    const spConfig = detail.spConfig || {};
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const timeStatus = getSetTimeStatus(
      toLongTs(detail.startAt),
      toLongTs(detail.endAt),
      currentTime,
    );
    if (timeStatus !== 'Pending') {
      // 比赛已开始，可以去获取其他数据
      dispatch({
        type: 'competitions/getProblems',
        payload: {
          id,
          force: true,
        },
      });
      // TODO 考虑去掉 force，当用户 AC 后主动用 force=true 请求一次
      dispatch({
        type: 'competitions/getProblemResultStats',
        payload: { id, force: true },
      });
      dispatch({
        type: 'competitions/getNotifications',
        payload: { id },
      });
      dispatch({
        type: 'competitions/getQuestions',
        payload: { id },
      });
      if (spConfig.genshinConfig?.useExplorationMode) {
        dispatch({
          type: 'competitions/getSpGenshinUnlockedSectionIds',
          payload: { id },
        });
        this.setSpGenshinKeyForceRefresh(detail);
      }
    }
  };

  setSpGenshinKeyForceRefresh = (detail: ICompetition) => {
    clearTimeout(this._keyInfoRefreshTimer);
    if (!detail) {
      return;
    }
    const spConfig = detail.spConfig || {};
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const durationSecond = Math.floor((endTime - startTime) / 1000);
    const elapsedTimeSecond = Math.floor((currentTime - startTime) / 1000);
    const options = spConfig.genshinConfig?.explorationModeOptions || {};
    const distributeOptions = options.waysToGetKey?.find(
      (w) => w.by === 'distributePeriodically',
    ) as ICompetitionSpConfigGenhinExplorationW2KByDistributePeriodically;
    if (!distributeOptions) {
      return;
    }

    const dStart = distributeOptions.startAtSecond;
    const dPeriod = distributeOptions.periodSecond;

    let nextSecond = dStart;
    this.setState({ nextSecond })
    do {
      if (nextSecond > elapsedTimeSecond || nextSecond >= durationSecond) {
        break;
      }
      if (!(dPeriod > 0)) {
        break;
      }
      nextSecond += dPeriod;
      this.setState({ nextSecond })
    } while (true);

    if (nextSecond >= durationSecond) {
      return;
    }

    const delay = Math.max(0, nextSecond - elapsedTimeSecond) + 1;
    console.log('key refresh delay:', delay, 'next:', nextSecond, 'elpsed:', elapsedTimeSecond);

    this._keyInfoRefreshTimer = window.setTimeout(() => {
      console.log('force update due to key need to refresh');
      this.forceUpdate();
      this.setSpGenshinKeyForceRefresh(this.props.detail);
    }, delay * 1000);
  };

  componentDidMount(): void {
    this.checkDetail(this.props.detail);
  }

  componentWillUnmount(): void {
    clearTimeout(this._keyInfoRefreshTimer);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!this.props.detail && nextProps.detail) {
      // console.log(this.props.detail, nextProps.detail);
      this.checkDetail(nextProps.detail);
    }
  }

  confirmEnter = () => {
    const { id, dispatch } = this.props;
    dispatch({
      type: 'competitions/confirmEnter',
      payload: {
        id,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Confirmed your participation');
        this.props.dispatch({
          type: 'competitions/getSelfUserDetail',
          payload: {
            id,
            force: true,
          },
        });
        tracker.event({
          category: 'competitions',
          action: 'confirmEnter',
        });
      }
    });
  };

  getCreateQuestionFormItems = () => {
    return [
      {
        name: 'Content',
        field: 'content',
        component: 'textarea',
        initialValue: '',
      },
    ];
  };

  evalVarScoreExpression = (
    score: number | null,
    varScoreExpression: string,
    detail: ICompetition,
    problemIndex: number,
    tries = 0,
    acceptedTime?: Date | string,
  ): number | null => {
    if (typeof score !== 'number') {
      return null;
    }
    if (!varScoreExpression) {
      return score;
    }

    try {
      const currentTime = Date.now() - ((window as any)._t_diff || 0);
      const startTime = toLongTs(detail.startAt);
      const elapsedMs = (acceptedTime ? toLongTs(acceptedTime) : currentTime) - startTime;
      const expression = compileVarScoreExpression(varScoreExpression, {
        score,
        problemIndex,
        elapsedTime: {
          h: Math.floor(elapsedMs / 1000 / 60 / 60),
          min: Math.floor(elapsedMs / 1000 / 60),
          s: Math.floor(elapsedMs / 1000),
        },
        tries,
      });
      try {
        // eslint-disable-next-line no-eval
        return eval(expression);
      } catch (e) {
        console.error('failed to eval var score expression', varScoreExpression, expression, e);
        return null;
      }
    } catch (e) {
      console.error('unknown error while evaling var score expression', e);
      return null;
    }
  };

  endCompetition = () => {
    const { id, dispatch } = this.props;
    dispatch({
      type: 'competitions/endCompetition',
      payload: { id },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Ended');
        tracker.event({
          category: 'competitions',
          action: 'end',
        });
        dispatch({
          type: 'competitions/getDetail',
          payload: {
            id,
            force: true,
          },
        });
      }
    });
  };

  handleTryUnlockModalConfirm = () => {
    const { id, dispatch, detail } = this.props;
    if (this.state.genshinTryUnlockModalInfo.canUnlock) {
      const section = detail?.spConfig?.genshinConfig?.explorationModeOptions?.sections?.find(
        (section) => section.id === this.state.genshinTryUnlockModalInfo.selectedSectionId,
      );
      dispatch({
        type: 'competitions/doCompetitionSpGenshinExplorationUnlock',
        payload: { id, sectionId: this.state.genshinTryUnlockModalInfo.selectedSectionId },
      }).then(async (ret) => {
        msg.auto(ret);
        if (ret.success) {
          msg.success('章节已解锁');
          tracker.event({
            category: 'competitions',
            action: 'spGenshinUnlockSection',
            label: this.state.genshinTryUnlockModalInfo.selectedSectionId,
          });

          try {
            await Promise.all([
              dispatch({
                type: 'competitions/getSpGenshinUnlockedSectionIds',
                payload: {
                  id,
                  force: true,
                },
              }),
              dispatch({
                type: 'competitions/getProblems',
                payload: {
                  id,
                  force: true,
                },
              }),
            ]);
          } catch (e) {
            console.error('Failed to refresh data after unlocked', e);
            msg.error('获取数据失败，请刷新页面重试');
          } finally {
            this.setState({ genshinTryUnlockModalVisible: false });
            competitionEmitter.emit(CompetitionEvents.SpGenshinSectionUnlocked, {
              competitionId: id,
              competition: detail,
              section,
            });
            // TODO 触发解锁动画
          }
        }
      });
    } else {
      this.setState({ genshinTryUnlockModalVisible: false });
    }
  };

  // 解锁区域
  handleTryUnlockSection = (section) => {
    const canUnlock = this.currentKeyNum >= (section.unlockKeyCost || 1);
    this.setState({
      genshinTryUnlockModalInfo: {
        selectedSectionId: section.id,
        canUnlock,
        keyCost: section.unlockKeyCost || 1,
      },
      genshinTryUnlockModalVisible: true,
    });
  };

  simpleFilterHTML = (html: string) => {
    let res = (html || '').replace(/^&nbsp;/, '').trim();
    if (res === '<p></p>') {
      res = '';
    }
    return res;
  };

  renderNormalBody() {
    const {
      id,
      session,
      selfUserDetail,
      detailLoading,
      detail,
      problemsLoading,
      problems,
      competitionProblemResultStats,
      notifications,
      notificationsLoading,
      questions,
      questionsLoading,
      confirmEnterLoading,
      confirmQuitLoading,
      endCompetitionLoading,
    } = this.props;

    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    const useScore = ['ICPCWithScore'].includes(detail.rule);
    const canEndCompetition =
      timeStatus === 'Ended' &&
      !detail.ended &&
      [ECompetitionUserRole.admin, ECompetitionUserRole.principal].includes(selfUserDetail?.role);

    return (
      <Row gutter={16} className="content-view" style={{ marginTop: '84px', marginBottom: '32px' }}>
        {selfUserDetail.banned && (
          <Col xs={24} className="mb-lg">
            <Alert
              message="Banned"
              description="You have been banned for violating the competition rules."
              type="error"
              showIcon
            />
          </Col>
        )}
        {selfUserDetail.status === ECompetitionUserStatus.quitted && (
          <Col xs={24} className="mb-lg">
            <Alert
              message="Quitted"
              description="You have confirmed to quit. The competition is readonly now and you cannot submit solution."
              type="warning"
              showIcon
            />
          </Col>
        )}

        <Col xs={24}>
          <Card bordered={false}>
            <h2 className="text-center">{detail.title}</h2>
            <p className="text-center" style={{ marginBottom: '5px' }}>
              <span>
                {moment(startTime).format('YYYY-MM-DD HH:mm')} ~{' '}
                {moment(endTime).format('YYYY-MM-DD HH:mm')}
              </span>
            </p>
            <p className="text-center">
              <TimeStatusBadge start={startTime} end={endTime} cur={currentTime} />
            </p>
            {canEndCompetition && (
              <p className="text-center">
                <Button
                  type="danger"
                  loading={detailLoading || endCompetitionLoading}
                  onClick={this.endCompetition}
                >
                  Confirm Result & End Competition
                </Button>
                <p className="text-center text-secondary mt-sm">
                  <small>
                    Once confirmed, it will release all frozen solutions, and will also trigger a
                    settlement if it's Rating Mode.
                  </small>
                </p>
              </p>
            )}
            {timeStatus === 'Pending' ? (
              <Countdown
                secs={Math.floor((startTime - currentTime) / 1000)}
                renderTime={(secs: number) => (
                  <h1 className="text-center" style={{ margin: '30px 0' }}>
                    {secToTimeStr(secs, true)}
                  </h1>
                )}
                handleRequestTimeSync={() => {
                  const currentTime = Date.now() - ((window as any)._t_diff || 0);
                  return Math.floor((startTime - currentTime) / 1000);
                }}
                timeSyncInterval={30000}
              />
            ) : (
              <div
                dangerouslySetInnerHTML={{ __html: xss(detail.announcement) }}
                className="content-area"
                style={{ marginTop: '15px' }}
              />
            )}
          </Card>
          {timeStatus !== 'Pending' && (
            <Card bordered={false} className="list-card">
              <Table
                dataSource={problems.rows}
                rowKey="problemId"
                loading={problemsLoading}
                pagination={false}
                className="responsive-table"
                rowClassName={(record: ICompetitionProblem) => {
                  const stats = competitionProblemResultStats[record.problemId];
                  return classNames(
                    'problem-result-mark-row',
                    { accepted: stats?.selfAccepted },
                    { attempted: !stats?.selfAccepted && stats?.selfTries > 0 },
                  );
                }}
              >
                <Table.Column
                  title=""
                  key="Index"
                  render={(text, record: ICompetitionProblem, index) => (
                    <div>{numberToAlphabet(index)}</div>
                  )}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: ICompetitionProblem, index) => (
                    <div>
                      <Link
                        to={urlf(pages.competitions.problemDetail, {
                          param: { id, alias: numberToAlphabet(index) },
                        })}
                      >
                        {record.title}
                      </Link>
                    </div>
                  )}
                />
                {useScore && (
                  <Table.Column
                    title="Score"
                    key="Score"
                    render={(text, record: ICompetitionProblem, index) => (
                      <div>
                        <span
                          className={
                            competitionProblemResultStats[record.problemId]?.selfAccepted
                              ? 'text-success'
                              : ''
                          }
                        >
                          {this.evalVarScoreExpression(
                            record.score,
                            record.varScoreExpression,
                            detail,
                            index,
                            (competitionProblemResultStats[record.problemId]?.selfTries || 0) -
                            (competitionProblemResultStats[record.problemId]?.selfAccepted
                              ? 1
                              : 0),
                            competitionProblemResultStats[record.problemId]?.selfAcceptedTime,
                          ) ?? '-'}
                        </span>
                        {typeof record.score === 'number' && (
                          <Explanation className="ml-sm-md">
                            <p className="mb-sm">Base Score: {record.score}</p>
                            {!!record.varScoreExpression && (
                              <p>
                                Score Rule:{' '}
                                {getReadableVarScoreExpression(record.varScoreExpression)}
                              </p>
                            )}
                          </Explanation>
                        )}
                      </div>
                    )}
                  />
                )}
                <Table.Column
                  title="Stats"
                  key="Statistics"
                  className="no-wrap"
                  render={(text, record: ICompetitionProblem) => {
                    if (!competitionProblemResultStats[record.problemId]) {
                      return null;
                    }
                    return (
                      <SolutionResultStats
                        accepted={competitionProblemResultStats[record.problemId].accepted}
                        submitted={competitionProblemResultStats[record.problemId].submitted}
                        toSolutionsLink={urlf(pages.competitions.solutions, {
                          param: { id },
                          query: { problemId: record.problemId },
                        })}
                      />
                    );
                  }}
                />
              </Table>
            </Card>
          )}
          {timeStatus !== 'Pending' && selfUserDetail?.role === ECompetitionUserRole.participant && (
            <>
              <div className="mt-lg">
                <Card bordered={false}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 className="mb-none">My Questions</h3>
                    <GeneralFormModal
                      loadingEffect="competitions/createCompetitionQuestion"
                      title="Ask Principal/Judger a Question"
                      autoMsg
                      items={this.getCreateQuestionFormItems()}
                      maskClosable={false}
                      submit={(dispatch: ReduxProps['dispatch'], values) => {
                        const data = {
                          content: values.content,
                        };
                        return dispatch({
                          type: 'competitions/createCompetitionQuestion',
                          payload: {
                            id,
                            data,
                          },
                        });
                      }}
                      onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                        msg.success('Submit successfully');
                        tracker.event({
                          category: 'competitions',
                          action: 'submitQuestion',
                        });
                      }}
                      onSuccessModalClosed={(
                        dispatch: ReduxProps['dispatch'],
                        ret: IApiResponse<any>,
                      ) => {
                        return dispatch({
                          type: 'competitions/getQuestions',
                          payload: {
                            id,
                            force: true,
                          },
                        });
                      }}
                    >
                      <Button size="small">Ask Question</Button>
                    </GeneralFormModal>
                  </div>
                </Card>
                <Card bordered={false} className="list-card" style={{ marginTop: '0' }}>
                  <Table
                    dataSource={questions}
                    rowKey="competitionQuestionId"
                    loading={questionsLoading}
                    pagination={false}
                    className="responsive-table"
                    locale={{
                      emptyText:
                        'If you have questions about rules or problems, please submit a question',
                    }}
                  >
                    <Table.Column
                      title="ID"
                      key="NID"
                      render={(text, record: ICompetitionQuestion) => (
                        <span>{record.competitionQuestionId}</span>
                      )}
                    />
                    <Table.Column
                      title="Content"
                      key="Content"
                      render={(text, record: ICompetitionQuestion) => <pre>{record.content}</pre>}
                    />
                    <Table.Column
                      title="Reply"
                      key="Reply"
                      render={(text, record: ICompetitionQuestion) => {
                        return record.reply ? (
                          <pre>{record.reply}</pre>
                        ) : (
                          <span className="text-secondary">(No reply yet)</span>
                        );
                      }}
                    />
                  </Table>
                </Card>
              </div>
              <div className="mt-lg">
                <Card bordered={false}>
                  <h3 className="mb-none">Notifications</h3>
                </Card>
                <Card bordered={false} className="list-card" style={{ marginTop: '0' }}>
                  <Table
                    dataSource={notifications}
                    rowKey="competitionNotificationId"
                    loading={notificationsLoading}
                    pagination={false}
                    className="responsive-table"
                    locale={{ emptyText: 'Important notifications will be displayed here' }}
                  >
                    <Table.Column
                      title="ID"
                      key="NID"
                      render={(text, record: ICompetitionNotification) => (
                        <span>{record.competitionNotificationId}</span>
                      )}
                    />
                    <Table.Column
                      title="Content"
                      key="Content"
                      render={(text, record: ICompetitionNotification) => (
                        <pre>{record.content}</pre>
                      )}
                    />
                  </Table>
                </Card>
              </div>
            </>
          )}
        </Col>
      </Row>
    );
  }

  renderGenshinBody = () => {
    const {
      id,
      session,
      selfUserDetail,
      detailLoading,
      detail,
      problemsLoading,
      problems,
      competitionProblemResultStats,
      notifications,
      notificationsLoading,
      questions,
      questionsLoading,
      confirmEnterLoading,
      confirmQuitLoading,
      endCompetitionLoading,
      spGenshinUnlockedSectionIds,
      spGenshinLoading,
      doCompetitionSpGenshinExplorationUnlockLoading,
    } = this.props;

    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const durationSecond = Math.floor((endTime - startTime) / 1000);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    const useScore = ['ICPCWithScore'].includes(detail.rule);
    const canEndCompetition =
      timeStatus === 'Ended' &&
      !detail.ended &&
      [ECompetitionUserRole.admin, ECompetitionUserRole.principal].includes(selfUserDetail?.role);
    const announcement = this.simpleFilterHTML(detail.announcement);

    let totalScore = 0;
    if (useScore) {
      totalScore = (problems.rows || []).reduce((acc, cur, index) => {
        const score = competitionProblemResultStats[cur.problemId]?.selfAccepted
          ? this.evalVarScoreExpression(
            cur.score,
            cur.varScoreExpression,
            detail,
            index,
            (competitionProblemResultStats[cur.problemId]?.selfTries || 0) -
            (competitionProblemResultStats[cur.problemId]?.selfAccepted ? 1 : 0),
            competitionProblemResultStats[cur.problemId]?.selfAcceptedTime,
          )
          : 0;
        return acc + (score || 0);
      }, 0);
    }

    return (
      <div className="genshin-theme-page">
        <div className="genshin-banner" />
        <div className="genshin-content">
          {selfUserDetail.banned && (
            <Alert
              style={{ width: '100%' }}
              message="Banned"
              description="You have been banned for violating the competition rules."
              type="error"
              showIcon
            />
          )}
          {selfUserDetail.status === ECompetitionUserStatus.quitted && (
            <Alert
              style={{ width: '100%' }}
              message="Quitted"
              description="You have confirmed to quit. The competition is readonly now and you cannot submit solution."
              type="warning"
              showIcon
            />
          )}

          <Card bordered={false} className="genshin-theme-card">
            <h2 className="text-center">{detail.title}</h2>
            <p className="text-center" style={{ marginBottom: '5px' }}>
              <span>
                {moment(startTime).format('YYYY-MM-DD HH:mm')} ~{' '}
                {moment(endTime).format('YYYY-MM-DD HH:mm')}
              </span>
            </p>
            <p className="text-center">
              <TimeStatusBadge start={startTime} end={endTime} cur={currentTime} />
            </p>
            {canEndCompetition && (
              <p className="text-center">
                <Button
                  type="danger"
                  loading={detailLoading || endCompetitionLoading}
                  onClick={this.endCompetition}
                >
                  Confirm Result & End Competition
                </Button>
                <p className="text-center text-secondary mt-sm">
                  <small>
                    Once confirmed, it will release all frozen solutions, and will also trigger a
                    settlement if it's Rating Mode.
                  </small>
                </p>
              </p>
            )}
            {timeStatus === 'Pending' ? (
              <Countdown
                secs={Math.floor((startTime - currentTime) / 1000)}
                renderTime={(secs: number) => (
                  <h1 className="text-center" style={{ margin: '30px 0' }}>
                    {secToTimeStr(secs, true)}
                  </h1>
                )}
                handleRequestTimeSync={() => {
                  const currentTime = Date.now() - ((window as any)._t_diff || 0);
                  return Math.floor((startTime - currentTime) / 1000);
                }}
                timeSyncInterval={30000}
              />
            ) : announcement ? (
              <div className="mt-lg" dangerouslySetInnerHTML={{ __html: xss(announcement) }} />
            ) : null}
          </Card>

          {timeStatus !== 'Pending' && <GenshinDivider />}

          {timeStatus !== 'Pending' && (
            <>
              <div className="genshin-state">
                <Popover content={<>总计得分：{spGenshinLoading ? '-' : totalScore}</>} >
                  <div className="genshin-state-score">
                    <div className="genshin-state-score-icon" />
                    <div className="genshin-state-score-text">
                      {spGenshinLoading ? '-' : totalScore}
                    </div>
                  </div>
                </Popover>
                <Popover content={<>
                  <p>章节钥匙：{this.currentKeyNum}</p>
                  {this.state.nextSecond < durationSecond &&
                    <p>下次发放：{secToTimeStr(this.state.nextSecond)}</p>}
                </>} >
                  <div className="genshin-state-key">
                    <div className="genshin-state-key-icon" />
                    <div className="genshin-state-key-text">
                      {spGenshinLoading ? '-' : this.currentKeyNum}
                    </div>
                  </div>
                </Popover>
                <GenshinButton buttonType="icon" iconType="help" />
              </div>
              <div className="genshin-sections">
                {detail?.spConfig?.genshinConfig?.explorationModeOptions?.sections?.map(
                  (section, index) => {
                    const unlocked =
                      section.unlockByDefault || spGenshinUnlockedSectionIds.includes(section.id);
                    return (
                      <div
                        className={classNames('genshin-section', `genshin-section-${section.id}`)}
                        key={section.id}
                      >
                        {/* 标题区 */}
                        <div className="genshin-section-header">
                          <span className="genshin-section-header-title">{section.title}</span>
                          <span className="genshin-section-header-icon" />
                        </div>
                        {/* 解锁遮罩 */}
                        {!unlocked && (
                          <div
                            className="genshin-section-curtain"
                            style={{ height: section.problemIndexes.length * 39 + 2 }}
                            onClick={() => this.handleTryUnlockSection(section)}
                          >
                            <div className="genshin-section-curtain-bg" />
                            {/* todo 解锁动画 */}
                            {/* <div className="genshin-section-curtain-icon" />
                        <div className="genshin-section-curtain-rect" /> */}
                            <div className="genshin-section-curtain-staticLock" />
                          </div>
                        )}
                        {/* 表格部分 */}
                        {unlocked && (
                          <Table
                            dataSource={section.problemIndexes
                              .map((id) => problems?.rows?.[id])
                              .filter(Boolean)}
                            rowKey="problemId"
                            loading={problemsLoading}
                            pagination={false}
                            showHeader={false}
                            className="genshin-section-table"
                            rowClassName={(record: ICompetitionProblem) =>
                              classNames('genshin-section-table-row')
                            }
                          >
                            <Table.Column
                              title="Alias"
                              key="Alias"
                              align="center"
                              width={120}
                              className="genshin-section-table-alias"
                              render={(text, record: ICompetitionProblem, index) => {
                                const stats = competitionProblemResultStats[record.problemId];
                                return (
                                  <div
                                    className={classNames(
                                      { accepted: stats?.selfAccepted },
                                      { attempted: !stats?.selfAccepted && stats?.selfTries > 0 },
                                    )}
                                  >
                                    <Link
                                      to={urlf(pages.competitions.problemDetail, {
                                        param: {
                                          id,
                                          alias:
                                            record.alias ||
                                            numberToAlphabet(section.problemIndexes[index]),
                                        },
                                      })}
                                    >
                                      {record.alias}
                                    </Link>
                                  </div>
                                );
                              }}
                            />
                            <Table.Column
                              title="Title"
                              key="Title"
                              className="genshin-section-table-title"
                              render={(text, record: ICompetitionProblem, index) => {
                                return (
                                  <div>
                                    <Link
                                      to={urlf(pages.competitions.problemDetail, {
                                        param: {
                                          id,
                                          alias:
                                            record.alias ||
                                            numberToAlphabet(section.problemIndexes[index]),
                                        },
                                      })}
                                      className={
                                        record.spConfig?.hasEgg ? 'genshin-problem-hasEgg' : ''
                                      }
                                    >
                                      <ProblemTitle problem={record} fallback="--" />
                                    </Link>
                                  </div>
                                );
                              }}
                            />
                            {useScore && (
                              <Table.Column
                                title="Score"
                                key="Score"
                                width={120}
                                align="left"
                                className="genshin-section-table-score"
                                render={(text, record: ICompetitionProblem, index) => {
                                  return (
                                    <Popover
                                      content={
                                        <>
                                          <p className="mb-sm">基础分数：{record.score}</p>
                                          {!!record.varScoreExpression && (
                                            <p>
                                              计算规则：
                                              {getReadableVarScoreExpressionZh(
                                                record.varScoreExpression,
                                              )}
                                            </p>
                                          )}
                                        </>
                                      }
                                    >
                                      <div style={{ display: 'flex' }}>
                                        <span
                                          className="genshin-section-table-score-icon mr-md"
                                          style={{ display: 'inline-block' }}
                                        />
                                        <span
                                          className={
                                            competitionProblemResultStats[record.problemId]
                                              ?.selfAccepted
                                              ? 'text-success'
                                              : ''
                                          }
                                        >
                                          {this.evalVarScoreExpression(
                                            record.score,
                                            record.varScoreExpression,
                                            detail,
                                            index,
                                            (competitionProblemResultStats[record.problemId]
                                              ?.selfTries || 0) -
                                            (competitionProblemResultStats[record.problemId]
                                              ?.selfAccepted
                                              ? 1
                                              : 0),
                                            competitionProblemResultStats[record.problemId]
                                              ?.selfAcceptedTime,
                                          ) ?? '-'}
                                        </span>
                                      </div>
                                    </Popover>
                                  );
                                }}
                              />
                            )}
                            <Table.Column
                              title="State"
                              key="State"
                              width={120}
                              align="right"
                              className="genshin-section-table-state"
                              render={(text, record: ICompetitionProblem, index) => {
                                if (!competitionProblemResultStats[record.problemId]) {
                                  return null;
                                }
                                return (
                                  <div>
                                    <Link
                                      to={urlf(pages.competitions.solutions, {
                                        param: { id },
                                        query: {
                                          problemId: record.problemId,
                                        },
                                      })}
                                    >
                                      {competitionProblemResultStats[record.problemId].accepted} /{' '}
                                      {competitionProblemResultStats[record.problemId].submitted}
                                    </Link>
                                  </div>
                                );
                              }}
                            />
                          </Table>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </>
          )}

          {timeStatus !== 'Pending' && <GenshinDivider />}

          {timeStatus !== 'Pending' && (
            <>
              <div className="genshin-section">
                <div className="genshin-section-header">
                  <div className="genshin-section-header-title">通知</div>
                </div>
                <Table
                  // dataSource={section.problemIndexes
                  //   .map((id) => problems?.rows?.[id])
                  //   .filter(Boolean)}
                  rowKey="problemId"
                  loading={problemsLoading}
                  pagination={false}
                  showHeader={false}
                  className="genshin-section-table"
                  rowClassName={(record: ICompetitionProblem) =>
                    classNames('genshin-section-table-row')
                  }
                >
                  <Table.Column
                    title="Something"
                    key="Something"
                    align="center"
                    width={120}
                    className="genshin-section-table-something"
                    render={(text, record: ICompetitionProblem, index) => {
                      return (
                        <>something</>
                      );
                    }}
                  />
                </Table>
              </div>
            </>
          )}

          {timeStatus !== 'Pending' && (
            <>
              <div className="genshin-section">
                <div className="genshin-section-header">
                  <div className="genshin-section-header-title">问答区</div>
                  <GenshinButton
                    text='提问'
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "20px",
                      transform: "translate(0, -50%)"
                    }}
                    buttonType='auto'
                  />
                </div>
                <Table
                  // dataSource={section.problemIndexes
                  //   .map((id) => problems?.rows?.[id])
                  //   .filter(Boolean)}
                  rowKey="problemId"
                  loading={problemsLoading}
                  pagination={false}
                  showHeader={false}
                  className="genshin-section-table"
                  rowClassName={(record: ICompetitionProblem) =>
                    classNames('genshin-section-table-row')
                  }
                >
                  <Table.Column
                    title="Something"
                    key="Something"
                    align="center"
                    width={120}
                    className="genshin-section-table-something"
                    render={(text, record: ICompetitionProblem, index) => {
                      return (
                        <>something</>
                      );
                    }}
                  />
                </Table>
              </div>
            </>
          )}


        </div>

        {
          timeStatus !== 'Pending' && selfUserDetail?.role === ECompetitionUserRole.participant && (
            <GenshinModal
              title="解锁区域"
              visible={this.state.genshinTryUnlockModalVisible}
              onHide={() => {
                this.setState({ genshinTryUnlockModalVisible: false });
              }}
              onOk={() => this.handleTryUnlockModalConfirm()}
              okText={this.state.genshinTryUnlockModalInfo.canUnlock ? '解锁' : '确认'}
              cancelButton={this.state.genshinTryUnlockModalInfo.canUnlock}
              confirmButton={true}
              confirmLoading={spGenshinLoading || doCompetitionSpGenshinExplorationUnlockLoading}
            >
              {this.state.genshinTryUnlockModalInfo.canUnlock ? (
                <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  是否使用
                  <span className="genshin-icon-key" />
                  {this.state.genshinTryUnlockModalInfo.keyCost} 解锁？
                </p>
              ) : (
                <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  当前持有
                  <span className="genshin-icon-key" />
                  <span className="mr-sm" style={{ color: '#d2392f' }}>
                    {this.currentKeyNum}
                  </span>
                  不足。
                </p>
              )}
            </GenshinModal>
          )
        }
      </div >
    );
  };

  render() {
    const { selfUserDetail, detailLoading, detail, confirmEnterLoading } = this.props;

    if (detailLoading || detailLoading === undefined || !detail) {
      return <PageLoading />;
    }
    if (
      selfUserDetail?.role === ECompetitionUserRole.participant &&
      selfUserDetail.status === ECompetitionUserStatus.available
    ) {
      return (
        <PageTitle title="Confirm Enter">
          <div className="content-view center-view">
            <div className="text-center" style={{ marginBottom: '30px' }}>
              <div className="mb-lg">Confirm your info to enter competition</div>
              <h1>Logged In as: {selfUserDetail.info.subname || selfUserDetail.info.nickname}</h1>
            </div>
            <div className="center-form">
              <Button
                type="primary"
                block
                loading={confirmEnterLoading}
                onClick={this.confirmEnter}
              >
                Confirm
              </Button>
            </div>
          </div>
        </PageTitle>
      );
    }

    return (
      <PageAnimation>
        <PageTitle title="Overview">
          {this.isGenshin ? this.renderGenshinBody() : this.renderNormalBody()}
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    session: state.competitions.session[id],
    selfUserDetail: state.competitions.selfUserDetail[id],
    detailLoading: state.loading.effects['competitions/getDetail'],
    detail: state.competitions.detail[id],
    problemsLoading: state.loading.effects['competitions/getProblems'],
    problems: state.competitions.problems[id] || {
      count: 0,
      rows: [],
    },
    competitionProblemResultStats: state.competitions.problemResultStats[id] || {},
    notifications: state.competitions.notifications[id]?.rows || [],
    notificationsLoading: state.loading.effects['competitions/getNotifications'],
    questions: state.competitions.questions[id]?.rows || [],
    questionsLoading: state.loading.effects['competitions/getQuestions'],
    spGenshinUnlockedSectionIds: state.competitions.spGenshinUnlockedSectionIds[id] || [],
    spGenshinUnlockedSectionIdsLoading:
      state.loading.effects['competitions/getSpGenshinUnlockedSectionIds'],
    spGenshinLoading:
      state.loading.effects['competitions/getSpGenshinUnlockedSectionIds'] ||
      state.loading.effects['competitions/getProblems'] ||
      state.loading.effects['competitions/getDetail'] ||
      state.loading.effects['competitions/getProblemResultStats'],
    confirmEnterLoading:
      state.loading.effects['competitions/confirmEnter'] ||
      state.loading.effects['competitions/getSelfUserDetail'],
    confirmQuitLoading:
      state.loading.effects['competitions/confirmQuit'] ||
      state.loading.effects['competitions/getSelfUserDetail'],
    endCompetitionLoading: !!state.loading.effects['competitions/endCompetition'],
    doCompetitionSpGenshinExplorationUnlockLoading: !!state.loading.effects[
      'competitions/doCompetitionSpGenshinExplorationUnlock'
    ],
  };
}

export default connect(mapStateToProps)(CompetitionOverview);
