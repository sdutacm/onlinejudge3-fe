import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Spin, Table, Popover, Progress } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import ProblemContent from '@/components/ProblemContent';
import constants from '@/configs/constants';
import gStyles from '@/general.less';
import xss from 'xss';
import { formatPercentage, numberToAlphabet, toLongTs, urlf } from '@/utils/format';
import moment from 'moment';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import TimeStatusBadge from '@/pages/contest/acm/components/TimeStatusBadge';
import styles from '@/pages/problems/index.less';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

interface Props extends ReduxProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problemsLoading: boolean;
  problems: FullList<IProblem>;
  userProblemResultStats: IUserProblemResultStats;
  contestProblemResultStats: IContestProblemResultStats;
}

interface State {
}

class ContestOverview extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    const { id, dispatch, session } = this.props;
    dispatch({
      type: 'contests/getDetail',
      payload: { id },
    });
    // TODO 仅比赛开始才 fetch 后面的数据
    dispatch({
      type: 'contests/getProblems',
      payload: { id },
    });
    dispatch({
      type: 'users/getProblemResultStats',
      payload: { userId: session.user.userId, contestId: id },
    });
    dispatch({
      type: 'contests/getProblemResultStats',
      payload: { id },
    });
  }

  render() {
    const {
      id,
      session,
      detailLoading,
      detail,
      problemsLoading,
      problems,
      userProblemResultStats: { acceptedProblemIds, attemptedProblemIds },
      contestProblemResultStats,
    } = this.props;
    // console.log(detailLoading, detail);
    // console.log(contestProblemResultStats);

    if (detailLoading || detailLoading === undefined || !detail) {
      return <Spin delay={constants.indicatorDisplayDelay} className={gStyles.spin} />;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    return (
        <Row gutter={16} className="content-view-sm">
          <Col xs={24}>
            <Card bordered={false}>
              <h2 className="text-center">{detail.title}</h2>
              <p className="text-center" style={{ marginBottom: '5px' }}>
                <span>{moment(startTime).format('YYYY-MM-DD HH:mm')} ~ {moment(endTime).format('YYYY-MM-DD HH:mm')}</span>
              </p>
              <p className="text-center">
                <TimeStatusBadge start={startTime} end={endTime} cur={currentTime} />
              </p>
              <div dangerouslySetInnerHTML={{ __html: xss(detail.description) }} style={{ marginTop: '15px' }} />
            </Card>
            <Card bordered={false} className="list-card">
              <Table dataSource={problems.rows}
                     rowKey="problemId"
                     loading={problemsLoading}
                     pagination={false}
                     className="responsive-table"
                     rowClassName={(record: IProblem) => classNames(
                       'problem-result-mark-row',
                       { 'accepted': ~acceptedProblemIds.indexOf(record.problemId) },
                       { 'attempted': ~attemptedProblemIds.indexOf(record.problemId) }
                     )}
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
                      <Link to={urlf(pages.contests.problemDetail, { param: { id, index } })}>{record.title}</Link>
                    </div>
                  )}
                />
                <Table.Column
                  title="Stats"
                  key="Statistics"
                  className="no-wrap"
                  render={(text, record: IProblem) => (
                    <Popover title="AC / Total" content={`${contestProblemResultStats[record.problemId].accepted} / ${contestProblemResultStats[record.problemId].submitted} (${formatPercentage(contestProblemResultStats[record.problemId].accepted, contestProblemResultStats[record.problemId].submitted)})`}>
                      <Link to={urlf(pages.solutions.index, { query: { problemId: record.problemId } })}
                            onClick={e => e.stopPropagation()}
                      >
                        <Progress className={styles.miniRatioProgress} type="circle"
                                  percent={contestProblemResultStats[record.problemId].accepted / contestProblemResultStats[record.problemId].submitted * 100 || 0} width={12}
                                  strokeWidth={12}
                                  showInfo={false}
                        />
                        <span className="ml-sm-md">{contestProblemResultStats[record.problemId].accepted}</span>
                      </Link>
                    </Popover>
                  )}
                />
              </Table>
            </Card>
          </Col>
        </Row>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    session: state.contests.session[id],
    detailLoading: state.loading.effects['contests/getDetail'],
    detail: state.contests.detail[id],
    problemsLoading: state.loading.effects['contests/getProblems'],
    problems: state.contests.problems[id] || {},
    userProblemResultStats: state.users.problemResultStats,
    contestProblemResultStats: state.contests.problemResultStats[id] || {},
  };
}

export default connect(mapStateToProps)(ContestOverview);
