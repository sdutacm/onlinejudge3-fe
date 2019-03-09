import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Spin, Table, Popover, Progress } from 'antd';
import { ReduxProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import xss from 'xss';
import { formatPercentage, numberToAlphabet, secToTimeStr, toLongTs, urlf } from '@/utils/format';
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

interface Props extends ReduxProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problemsLoading: boolean;
  problems: IFullList<IProblem>;
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

  checkDetail = (detail: IContest) => {
    const { id, session, dispatch } = this.props;
    // console.log('check', detail);
    if (!detail) {
      return;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const timeStatus = getSetTimeStatus(toLongTs(detail.startAt), toLongTs(detail.endAt), currentTime);
    if (timeStatus !== 'Pending') { // 比赛已开始，可以去获取其他数据
      dispatch({
        type: 'users/getProblemResultStats',
        payload: { userId: session.user.userId, contestId: id },
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
      return <PageLoading />;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);

    return (
      <PageAnimation>
        <PageTitle title="Overview">
          <Row gutter={16} className="content-view">
            <Col xs={24}>
              <Card bordered={false}>
                <h2 className="text-center">{detail.title}</h2>
                <p className="text-center" style={{ marginBottom: '5px' }}>
                  <span>{moment(startTime).format('YYYY-MM-DD HH:mm')} ~ {moment(endTime).format('YYYY-MM-DD HH:mm')}</span>
                </p>
                <p className="text-center">
                  <TimeStatusBadge start={startTime} end={endTime} cur={currentTime} />
                </p>
                {timeStatus === 'Pending' ?
                  <Countdown secs={Math.floor((startTime - currentTime) / 1000)}
                             renderTime={(secs: number) =>
                               <h1 className="text-center" style={{ margin: '30px 0' }}>{secToTimeStr(secs, true)}</h1>
                             }
                             handleRequestTimeSync={() => {
                               const currentTime = Date.now() - ((window as any)._t_diff || 0);
                               return Math.floor((startTime - currentTime) / 1000);
                             }}
                             timeSyncInterval={30000}
                  /> :
                  <div dangerouslySetInnerHTML={{ __html: xss(detail.description) }}
                       className="content-area"
                       style={{ marginTop: '15px' }}
                  />
                }
              </Card>
              {timeStatus !== 'Pending' &&
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
                        <Link to={urlf(pages.contests.problemDetail, { param: { id, index: numberToAlphabet(index) } })}>{record.title}</Link>
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
                          toSolutionsLink={urlf(pages.contests.solutions, { param: { id }, query: { problemId: record.problemId } })}
                        />
                      );
                    }}
                  />
                </Table>
              </Card>}
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
