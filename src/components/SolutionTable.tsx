import React from 'react';
import { withRouter } from 'react-router';
import pages from '@/configs/pages';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import UserBar from '@/components/UserBar';
import ResultBar from '@/components/ResultBar';
import { langsMap } from '@/configs/solutionLanguages';
import TimeBar from '@/components/TimeBar';
import limits from '@/configs/limits';
import { Table, Icon } from 'antd';
import classNames from 'classnames';
import { Results } from '@/configs/results';
import { ContestTypes } from '@/configs/contestTypes';
import ProblemBar from '@/components/ProblemBar';
import { checkPerms } from '@/utils/permission';
import { isFinishedResult } from '@/utils/judger';
import IdBasedPagination from './IdBasedPagination';
import { EPerm } from '@/common/configs/perm.config';

export interface Props extends ReduxProps, RouteProps {
  loading: boolean;
  data: IIdPaginationList<ISolution>;
  showPagination: boolean;
  isDetail: boolean;
  contestId?: number;
  competitionId?: number;
  problemList?: any[];
  session?: ISessionStatus;
  rating?: boolean;
  showId?: boolean;
}

interface State {
  timer: number;
  updateItv: number;
  judgeStatusMap: Record<number, IJudgeStatus>;
}

class SolutionTable extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      updateItv: 2000,
      judgeStatusMap: {},
    };
  }

  componentDidMount() {
    const timer: any = setInterval(this.updatePendingSolutions, this.state.updateItv);
    this.setState({ timer });
    this.subscribe();
    // @ts-ignore
    window._eventSource.judger.addEventListener('status', this.onJudgeStatus);
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
    // @ts-ignore
    window._eventSource.judger.removeEventListener('status', this.onJudgeStatus);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (this.props.data !== nextProps.data) {
      this.subscribe(nextProps.data);
    }
  }

  onJudgeStatus = async (e) => {
    const status = e.detail as IJudgeStatus;
    console.log(status);
    this.setState({
      judgeStatusMap: {
        ...this.state.judgeStatusMap,
        [status.solutionId]: status,
      },
    });
    if (isFinishedResult(status.result)) {
      const { data } = await this.props.dispatch({
        type: 'solutions/getListByIds',
        payload: {
          type: this.props.isDetail ? 'detail' : 'list',
          solutionIds: [status.solutionId],
        },
      });

      if (this.props.isDetail) {
        for (const item in data) {
          if (data[item].result === Results.CE) {
            this.props.dispatch({
              type: 'solutions/getDetailForCompilationInfo',
              payload: {
                id: item,
              },
            });
          }
        }
      }
    }
  };

  subscribe = (data?: Props['data']) => {
    const { rows } = data || this.props.data;
    const solutionIds: number[] = [];
    for (const row of rows) {
      if (row.result === Results.WT || row.result === Results.JG || row.result === Results.RPD) {
        solutionIds.unshift(row.solutionId);
      }
    }
    // @ts-ignore
    window._sockets.judger.emit('subscribe', solutionIds);
    console.log('subscribe', solutionIds);
  };

  updatePendingSolutions = async () => {
    const { rows } = this.props.data;
    const solutionIds: number[] = [];
    for (const row of rows) {
      if (row.result === Results.WT || row.result === Results.JG) {
        solutionIds.unshift(row.solutionId);
      }
    }

    if (solutionIds.length) {
      const { data } = await this.props.dispatch({
        type: 'solutions/getListByIds',
        payload: {
          type: this.props.isDetail ? 'detail' : 'list',
          solutionIds,
        },
      });

      if (this.props.isDetail) {
        for (const item in data) {
          if (data[item].result === Results.CE) {
            this.props.dispatch({
              type: 'solutions/getDetailForCompilationInfo',
              payload: {
                id: item,
              },
            });
          }
        }
      }
    }
  };

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  get limit() {
    return +this.props.location.query.limit || limits.solutions.list;
  }

  get rows() {
    return this.props.data?.rows || [];
  }

  get count() {
    return this.rows.length;
  }

  get paginationMode() {
    return this.props.location.query.lt
      ? 'has_to_next'
      : this.props.location.query.gt
      ? 'has_to_prev'
      : 'initial';
  }

  get hasPrev() {
    switch (this.paginationMode) {
      case 'initial':
        return false;
      case 'has_to_next':
        return true;
      case 'has_to_prev':
        return this.count >= this.limit;
      default:
        return false;
    }
  }

  get hasNext() {
    switch (this.paginationMode) {
      case 'initial':
        return this.count >= this.limit;
      case 'has_to_next':
        return this.count >= this.limit;
      case 'has_to_prev':
        return true;
      default:
        return true;
    }
  }

  handleGoPrev = () => {
    if (this.paginationMode === 'has_to_next' && this.count === 0) {
      router.goBack();
      return;
    }
    const query = { ...this.props.location.query, gt: this.rows[0]?.solutionId };
    delete query.lt;
    router.push({
      pathname: this.props.location.pathname,
      query,
    });
  };

  handleGoNext = () => {
    const query = { ...this.props.location.query, lt: this.rows[this.rows.length - 1]?.solutionId };
    delete query.gt;
    router.push({
      pathname: this.props.location.pathname,
      query,
    });
  };

  canViewDetail = (solution: ISolution) => {
    const { isDetail, session } = this.props;
    if (isDetail || !session || !session.loggedIn) {
      return false;
    }
    if (
      solution.shared ||
      solution.user.userId === session.user.userId ||
      checkPerms(session, EPerm.ReadSolution)
    ) {
      return true;
    }
    return false;
  };

  render() {
    const {
      loading,
      data: { rows },
      showPagination,
      isDetail,
      contestId,
      competitionId,
      problemList,
      location,
      rating,
      showId,
    } = this.props;
    return (
      <>
        <Table
          dataSource={rows}
          rowKey="solutionId"
          loading={loading}
          pagination={false}
          className={classNames('responsive-table', {
            'click-table': !isDetail,
            'single-row-table': isDetail,
          })}
          onRow={(record) => {
            const solutionDetailUrl = contestId
              ? urlf(pages.contests.solutionDetail, {
                  param: {
                    id: contestId,
                    sid: record.solutionId,
                  },
                })
              : competitionId
              ? urlf(pages.competitions.solutionDetail, {
                  param: {
                    id: competitionId,
                    sid: record.solutionId,
                  },
                })
              : urlf(pages.solutions.detail, {
                  param: { id: record.solutionId },
                  query: { from: location.query.from },
                });
            return {
              onClick: () => !this.props.isDetail && router.push(solutionDetailUrl),
            };
          }}
        >
          {(isDetail || showId) && (
            <Table.Column
              title="ID"
              key="ID"
              render={(text, record: ISolution) => <span>{record.solutionId}</span>}
            />
          )}
          <Table.Column
            title="User"
            key="User"
            render={(text, record: ISolution) => (
              <UserBar
                user={record.user}
                isContestUser={record.contest && record.contest.type === ContestTypes.Register}
                showAsText={!!competitionId}
                hideAvatar={!!competitionId}
                showRating={rating}
              />
            )}
          />
          <Table.Column
            title="Prob."
            key="Problem"
            render={(text, record: ISolution) => {
              let contestProblem = null;
              if ((contestId || competitionId) && problemList) {
                for (const problem of problemList) {
                  if (problem.problemId === record.problem.problemId) {
                    contestProblem = problem;
                    break;
                  }
                }
              }
              return (
                <ProblemBar
                  problem={contestProblem || record.problem}
                  contestId={contestId}
                  competitionId={competitionId}
                  index={contestProblem ? contestProblem.index : undefined}
                />
              );
            }}
          />
          <Table.Column
            title="Res."
            key="Result"
            dataIndex="solutionId"
            className="result-bar"
            render={(text, record: ISolution) => {
              const { current = 0, total = 0 } = this.state.judgeStatusMap[record.solutionId] || {};
              return (
                <ResultBar
                  percent={total ? (current / total) * 100 : 0}
                  current={current}
                  total={total}
                  result={record.result}
                  judgeInfo={record.judgeInfo}
                />
              );
            }}
          />
          <Table.Column
            title="Time"
            key="Time"
            className="near-result-bar"
            render={(text, record: ISolution) => <span>{record.time}</span>}
          />
          <Table.Column
            title="Mem."
            key="Memory"
            render={(text, record: ISolution) => <span>{record.memory}</span>}
          />
          <Table.Column
            title="Len."
            key="Length"
            render={(text, record: ISolution) => <span>{record.codeLength}</span>}
          />
          <Table.Column
            title="Lang."
            key="Language"
            render={(text, record: ISolution) => (
              <span>
                {langsMap[record.language]
                  ? langsMap[record.language].displayShortName
                  : record.language}
              </span>
            )}
          />
          <Table.Column
            title="At"
            key="At"
            render={(text, record: ISolution) => (
              <TimeBar time={new Date(record.createdAt).getTime()} />
            )}
          />
          {!isDetail && (
            <Table.Column
              title=""
              key=""
              className="float-btn"
              render={(text, record: ISolution) => {
                const solutionDetailUrl = contestId
                  ? urlf(pages.contests.solutionDetail, {
                      param: { id: contestId, sid: record.solutionId },
                    })
                  : competitionId
                  ? urlf(pages.competitions.solutionDetail, {
                      param: { id: competitionId, sid: record.solutionId },
                    })
                  :urlf(pages.solutions.detail, { param: { id: record.solutionId } });
                return (
                  <Link
                    to={solutionDetailUrl}
                    onClick={(e) => e.stopPropagation()}
                    className={this.canViewDetail(record) ? 'show' : ''}
                  >
                    <Icon type="ellipsis" theme="outlined" />
                  </Link>
                );
              }}
            />
          )}
        </Table>
        {showPagination ? (
          // <Pagination
          //   className="ant-table-pagination"
          //   total={count}
          //   current={page}
          //   pageSize={limits.solutions.list}
          //   onChange={this.handlePageChange}
          // />
          <IdBasedPagination
            hasPrev={this.hasPrev}
            hasNext={this.hasNext}
            onGoPrev={this.handleGoPrev}
            onGoNext={this.handleGoNext}
          />
        ) : (
          <div />
        )}
      </>
    );
  }
}

export default withRouter(SolutionTable);
