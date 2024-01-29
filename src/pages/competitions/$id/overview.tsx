import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Table, Button, Alert } from 'antd';
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
} from '@/common/interfaces/competition';
import { ECompetitionUserRole, ECompetitionUserStatus } from '@/common/enums';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import GeneralFormModal from '@/components/GeneralFormModal';
import Explanation from '@/components/Explanation';
import { getReadableVarScoreExpression } from '@/utils/competition';
import { compileVarScoreExpression } from '@/common/utils/competition';
import GenshinModal from '@/components/GenshinModal';
import GenshinDivider from '@/components/GenshinDivider';

export interface Props extends ReduxProps {
  id: number;
  session: ICompetitionSessionStatus;
  selfUserDetail: ICompetitionUser;
  detailLoading: boolean;
  detail: ICompetition;
  problemsLoading: boolean;
  problems: IFullList<ICompetitionProblem>;
  userProblemResultStats: IUserProblemResultStats;
  competitionProblemResultStats: ICompetitionProblemResultStats;
  notifications: ICompetitionNotification[];
  notificationsLoading: boolean;
  questions: ICompetitionQuestion[];
  questionsLoading: boolean;
  confirmEnterLoading: boolean;
  confirmQuitLoading: boolean;
  endCompetitionLoading: boolean;
}

interface State {
  genshinModalVisible: boolean
}

class CompetitionOverview extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      genshinModalVisible: false
    };
  }

  get isGenshin() {
    return this.props?.detail?.spConfig?.preset === 'genshin';
  }

  checkDetail = (detail: ICompetition) => {
    const { id, session, dispatch } = this.props;
    console.log('check', detail);
    if (!detail) {
      return;
    }
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
        type: 'users/getProblemResultStats',
        payload: {
          userId: session.user.userId,
          competitionId: id,
          force: true,
        },
      });
      dispatch({
        type: 'competitions/getProblemResultStats',
        payload: { id },
      });
      dispatch({
        type: 'competitions/getNotifications',
        payload: { id },
      });
      dispatch({
        type: 'competitions/getQuestions',
        payload: { id },
      });
    }
  };

  componentDidMount(): void {
    if (this.props.detail.spConfig?.preset === 'genshin') {
      const BodyElement = document.querySelector('body');
      BodyElement.classList.add('genshin-theme');
      console.log('Genshin, start!')
    }
    this.checkDetail(this.props.detail);
  }

  componentWillUnmount(): void {
    if (this.props.detail.spConfig?.preset === 'genshin') {
      const BodyElement = document.querySelector('body');
      BodyElement.classList.remove('genshin-theme');
      console.log('Genshin, exit!')
    }
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

  // 解锁区域
  handleUnlockSection = () => {
    this.setState({ genshinModalVisible: true })
  }

  renderNormalBody() {
    const {
      id,
      session,
      selfUserDetail,
      detailLoading,
      detail,
      problemsLoading,
      problems,
      userProblemResultStats: { acceptedProblemIds, attemptedProblemIds },
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
      <>
        <Row gutter={16} className="content-view">
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
                      Once confirmed, it will release all frozen solutions, and will also trigger
                      a settlement if it's Rating Mode.
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
                  rowClassName={(record: ICompetitionProblem) =>
                    classNames(
                      'problem-result-mark-row',
                      { accepted: ~acceptedProblemIds.indexOf(record.problemId) },
                      { attempted: ~attemptedProblemIds.indexOf(record.problemId) },
                    )
                  }
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
                            param: { id, index: numberToAlphabet(index) },
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
            {timeStatus !== 'Pending' &&
              selfUserDetail?.role === ECompetitionUserRole.participant && (
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
                          onSuccess={(
                            dispatch: ReduxProps['dispatch'],
                            ret: IApiResponse<any>,
                          ) => {
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
                          render={(text, record: ICompetitionQuestion) => (
                            <pre>{record.content}</pre>
                          )}
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
      </>
    )
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
      userProblemResultStats: { acceptedProblemIds, attemptedProblemIds },
      competitionProblemResultStats,
      notifications,
      notificationsLoading,
      questions,
      questionsLoading,
      confirmEnterLoading,
      confirmQuitLoading,
      endCompetitionLoading,
    } = this.props;
    return (
      <>
        <div className="genshin-theme-page">
          <div className="genshin-banner"></div>
          <div className="genshin-content">
            {selfUserDetail.banned && (
              <Alert
                style={{ width: "100%" }}
                message="Banned"
                description="You have been banned for violating the competition rules."
                type="error"
                showIcon
              />
            )}
            {selfUserDetail.status === ECompetitionUserStatus.quitted && (
              <Alert
                style={{ width: "100%" }}
                message="Quitted"
                description="You have confirmed to quit. The competition is readonly now and you cannot submit solution."
                type="warning"
                showIcon
              />
            )}
            <div className="genshin-notice">
              <p>公告部分，一些比赛属性和公告</p>
              <p>公告部分，一些比赛属性和公告</p>
              <p>公告部分，一些比赛属性和公告</p>
              <p>公告部分，一些比赛属性和公告</p>
            </div>
            <GenshinDivider />
            <div className="genshin-state">
              <div className="genshin-state-score">
                <div className="genshin-state-score-icon"></div>
                <div className="genshin-state-score-text">11451</div>
              </div>
              <div className="genshin-state-key">
                <div className="genshin-state-key-icon"></div>
                <div className="genshin-state-key-text">4</div>
              </div>
              <div className="genshin-state-qa"></div>
            </div>
            <div className="genshin-sections">
              {detail?.spConfig?.genshinConfig?.explorationModeOptions?.sections?.map((item, index) => {
                return (
                  <div className={classNames(
                    "genshin-section",
                    `genshin-section-${item.id}`
                  )}>
                    {/* 标题区 */}
                    <div className="genshin-section-header">
                      <span className="genshin-section-header-title">{item.title}</span>
                      <span className="genshin-section-header-icon"></span>
                    </div>
                    {/* 解锁遮罩 */}
                    <div className="genshin-section-curtain" style={{ height: item.problemIndexes.length * 48 }} onClick={() => this.handleUnlockSection()}>
                      <div className="genshin-section-curtain-bg"></div>
                      <div className="genshin-section-curtain-icon"></div>
                      <div className="genshin-section-curtain-text">消耗 🔑{item?.unlockKeyCost}1 以解锁</div>
                    </div>
                    {/* 表格部分 */}
                    <Table
                      dataSource={item.problemIndexes.map(id => problems?.rows?.[id]).filter(Boolean)}
                      rowKey="problemId"
                      loading={problemsLoading}
                      pagination={false}
                      showHeader={false}
                      className="genshin-section-table"
                      rowClassName={(record: ICompetitionProblem) =>
                        classNames("genshin-section-table-row")
                      }
                    >
                      <Table.Column
                        title="Alias"
                        key="Alias"
                        align="center"
                        width={120}
                        className="genshin-section-table-alias"
                        render={(text, record: ICompetitionProblem, index) => {
                          return <div>
                            <Link
                              to={urlf(pages.competitions.problemDetail, {
                                param: { id, index: numberToAlphabet(item.problemIndexes[index]) },
                              })}
                            >
                              {record.alias}
                            </Link>
                          </div>
                        }}
                      />
                      <Table.Column
                        title="Title"
                        key="Title"
                        className="genshin-section-table-title"
                        render={(text, record: ICompetitionProblem, index) => {
                          return <div>
                            <Link
                              to={urlf(pages.competitions.problemDetail, {
                                param: { id, index: numberToAlphabet(item.problemIndexes[index]) },
                              })}
                            >
                              {record.title}
                            </Link>
                          </div>
                        }}
                      />
                      <Table.Column
                        title="Score"
                        key="Score"
                        width={120}
                        className="genshin-section-table-score"
                        render={(text, record: ICompetitionProblem, index) => {
                          return <div>💠 {record.score}</div>
                        }}
                      />
                      <Table.Column
                        title="State"
                        key="State"
                        width={120}
                        className="genshin-section-table-state"
                        render={(text, record: ICompetitionProblem, index) => {
                          return <div>29 / 55</div>
                        }}
                      />
                    </Table>
                  </div>
                )
              })
              }
            </div>
          </div>
          <GenshinModal
            title="解锁区域"
            visible={this.state.genshinModalVisible}
            onHide={() => {
              this.setState({ genshinModalVisible: false })
            }}
          >
            您确定花费xxx解锁当前区域吗？
          </GenshinModal>
        </div>
      </>
    )
  }

  render() {
    const {
      id,
      session,
      selfUserDetail,
      detailLoading,
      detail,
      problemsLoading,
      problems,
      userProblemResultStats: { acceptedProblemIds, attemptedProblemIds },
      competitionProblemResultStats,
      notifications,
      notificationsLoading,
      questions,
      questionsLoading,
      confirmEnterLoading,
      confirmQuitLoading,
      endCompetitionLoading,
    } = this.props;

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
    problems: state.competitions.problems[id] || {},
    userProblemResultStats: state.users.problemResultStats,
    competitionProblemResultStats: state.competitions.problemResultStats[id] || {},
    notifications: state.competitions.notifications[id]?.rows || [],
    notificationsLoading: state.loading.effects['competitions/getNotifications'],
    questions: state.competitions.questions[id]?.rows || [],
    questionsLoading: state.loading.effects['competitions/getQuestions'],
    confirmEnterLoading:
      state.loading.effects['competitions/confirmEnter'] ||
      state.loading.effects['competitions/getSelfUserDetail'],
    confirmQuitLoading:
      state.loading.effects['competitions/confirmQuit'] ||
      state.loading.effects['competitions/getSelfUserDetail'],
    endCompetitionLoading: !!state.loading.effects['competitions/endCompetition'],
  };
}

export default connect(mapStateToProps)(CompetitionOverview);
