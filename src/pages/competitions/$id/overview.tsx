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
import { ICompetition, ICompetitionUser } from '@/common/interfaces/competition';
import { ECompetitionUserRole, ECompetitionUserStatus } from '@/common/enums';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps {
  id: number;
  session: ICompetitionSessionStatus;
  selfUserDetail: ICompetitionUser;
  detailLoading: boolean;
  detail: ICompetition;
  problemsLoading: boolean;
  problems: IFullList<IProblem>;
  userProblemResultStats: IUserProblemResultStats;
  competitionProblemResultStats: IContestProblemResultStats;
  confirmEnterLoading: boolean;
  confirmQuitLoading: boolean;
}

interface State {}

class CompetitionOverview extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkDetail = (detail: ICompetition) => {
    const { id, session, dispatch } = this.props;
    // console.log('check', detail);
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
    }
  };

  componentDidMount(): void {
    this.checkDetail(this.props.detail);
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
      confirmEnterLoading,
      confirmQuitLoading,
    } = this.props;
    // console.log(detailLoading, detail);
    // console.log(competitionProblemResultStats);

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
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);

    return (
      <PageAnimation>
        <PageTitle title="Overview">
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
                ) : null}
              </Card>
              {timeStatus !== 'Pending' && (
                <Card bordered={false} className="list-card">
                  <Table
                    dataSource={problems.rows}
                    rowKey="problemId"
                    loading={problemsLoading}
                    pagination={false}
                    className="responsive-table"
                    rowClassName={(record: IProblem) =>
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
                      render={(text, record: IProblem, index) => (
                        <div>{numberToAlphabet(index)}</div>
                      )}
                    />
                    <Table.Column
                      title="Title"
                      key="Title"
                      render={(text, record: IProblem, index) => (
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
                    <Table.Column
                      title="Stats"
                      key="Statistics"
                      className="no-wrap"
                      render={(text, record: IProblem) => {
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
            </Col>
          </Row>
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
    confirmEnterLoading:
      state.loading.effects['competitions/confirmEnter'] ||
      state.loading.effects['competitions/getSelfUserDetail'],
    confirmQuitLoading:
      state.loading.effects['competitions/confirmQuit'] ||
      state.loading.effects['competitions/getSelfUserDetail'],
  };
}

export default connect(mapStateToProps)(CompetitionOverview);