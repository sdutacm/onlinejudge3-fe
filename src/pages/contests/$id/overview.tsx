import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Table, Button } from 'antd';
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
import contestRP from '@/configs/contestRP';
import RedPacketModal from '@/components/RedPacketModal';
import { checkPerms } from '@/utils/permission';
import { EPerm } from '@/common/configs/perm.config';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import ProblemTitle from '@/components/ProblemTitle';

export interface Props extends ReduxProps {
  id: number;
  globalSession: ISessionStatus;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problemsLoading: boolean;
  problems: IFullList<IProblem>;
  userProblemResultStats: IUserProblemResultStats;
  contestProblemResultStats: IContestProblemResultStats;
  endContestLoading: boolean;
}

interface State {}

class ContestOverview extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkDetail = (detail: IContest) => {
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
      // TODO 考虑去掉 force，当用户 AC 后主动用 force=true 请求一次
      dispatch({
        type: 'users/getProblemResultStats',
        payload: {
          userId: session.user.userId,
          contestId: id,
          force: true,
        },
      });
      dispatch({
        type: 'contests/getProblemResultStats',
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

  endContest = () => {
    const { id, dispatch } = this.props;
    dispatch({
      type: 'contests/endContest',
      payload: { id },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Ended');
        tracker.event({
          category: 'contests',
          action: 'end',
        });
        dispatch({
          type: 'contests/getDetail',
          payload: {
            id,
            force: true,
          },
        });
      }
    });
  };

  render() {
    const {
      id,
      globalSession,
      session,
      detailLoading,
      detail,
      problemsLoading,
      problems,
      userProblemResultStats: { acceptedProblemIds, attemptedProblemIds },
      contestProblemResultStats,
      endContestLoading,
    } = this.props;
    // console.log(detailLoading, detail);
    // console.log(contestProblemResultStats);

    if (detailLoading || detailLoading === undefined || !detail) {
      return <PageLoading />;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    const isContestRP = !!contestRP[id];
    const canEndContest =
      timeStatus === 'Ended' && !detail.ended && checkPerms(globalSession, EPerm.EndContest);

    return (
      <PageAnimation>
        <PageTitle title="Overview">
          <Row gutter={16} className="content-view">
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
                {canEndContest && (
                  <p className="text-center">
                    <Button
                      type="danger"
                      loading={detailLoading || endContestLoading}
                      onClick={this.endContest}
                    >
                      Confirm Result & End Contest
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
                    dangerouslySetInnerHTML={{ __html: xss(detail.description) }}
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
                    rowClassName={(record: IProblem) =>
                      classNames(
                        'problem-result-mark-row',
                        { accepted: ~acceptedProblemIds.indexOf(record.problemId) },
                        { attempted: ~attemptedProblemIds.indexOf(record.problemId) },
                      )
                    }
                  >
                    {isContestRP && (
                      <Table.Column
                        title=""
                        key="RedPacket"
                        render={(text, record: IProblem, index) => {
                          const rpList = contestRP[id];
                          const rp = rpList.find((rp) => rp.problemId === record.problemId);
                          if (rp && ~acceptedProblemIds.indexOf(record.problemId)) {
                            return (
                              <RedPacketModal rpKey={rp.key} rpNote={rp.note}>
                                <Button type="danger" size="small">
                                  AC 红包
                                </Button>
                              </RedPacketModal>
                            );
                          }
                          return null;
                        }}
                      />
                    )}
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
                            to={urlf(pages.contests.problemDetail, {
                              param: { id, index: numberToAlphabet(index) },
                            })}
                          >
                            <ProblemTitle problem={record} fallback="--" />
                          </Link>
                        </div>
                      )}
                    />
                    <Table.Column
                      title="Stats"
                      key="Statistics"
                      className="no-wrap"
                      render={(text, record: IProblem) => {
                        if (!contestProblemResultStats[record.problemId]) {
                          return null;
                        }
                        return (
                          <SolutionResultStats
                            accepted={contestProblemResultStats[record.problemId].accepted}
                            submitted={contestProblemResultStats[record.problemId].submitted}
                            toSolutionsLink={urlf(pages.contests.solutions, {
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
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    globalSession: state.session,
    session: state.contests.session[id],
    detailLoading: state.loading.effects['contests/getDetail'],
    detail: state.contests.detail[id],
    problemsLoading: state.loading.effects['contests/getProblems'],
    problems: state.contests.problems[id] || {},
    userProblemResultStats: state.users.problemResultStats,
    contestProblemResultStats: state.contests.problemResultStats[id] || {},
    endContestLoading: !!state.loading.effects['contests/endContest'],
  };
}

export default connect(mapStateToProps)(ContestOverview);
