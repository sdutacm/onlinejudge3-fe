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
import { Table, Pagination, Icon } from 'antd';
import classNames from 'classnames';
import { Results } from '@/configs/results';
import { ContestTypes } from '@/configs/contestTypes';
import ProblemBar from '@/components/ProblemBar';
import { isPermissionDog } from '@/utils/permission';

export interface Props extends ReduxProps, RouteProps {
  loading: boolean;
  data: IList<ISolution>;
  showPagination: boolean;
  isDetail: boolean;
  contestId?: number;
  problemList?: any[];
  session?: ISessionStatus;
  rating?: boolean;
  showId?: boolean;
}

interface State {
  timer: number;
  updateItv: number;
}

class SolutionTable extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      updateItv: 2000,
    };
  }

  componentDidMount() {
    const timer: any = setInterval(this.updatePendingSolutions, this.state.updateItv);
    this.setState({ timer });
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

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

  canViewDetail = (solution: ISolution) => {
    const { isDetail, session } = this.props;
    if (isDetail || !session || !session.loggedIn) {
      return false;
    }
    if (
      solution.shared ||
      solution.user.userId === session.user.userId ||
      isPermissionDog(session)
    ) {
      return true;
    }
    return false;
  };

  render() {
    const {
      loading,
      data: { page, count, rows },
      showPagination,
      isDetail,
      contestId,
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
                showRating={rating}
              />
            )}
          />
          <Table.Column
            title="Prob."
            key="Problem"
            render={(text, record: ISolution) => {
              let contestProblem = null;
              if (contestId && problemList) {
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
            render={(text, record: ISolution) => (
              <ResultBar percent={0} timeLimit={record.problem.timeLimit} result={record.result} />
            )}
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
            render={(text, record: ISolution) => <TimeBar time={record.createdAt * 1000} />}
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
                  : urlf(pages.solutions.detail, { param: { id: record.solutionId } });
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
          <Pagination
            className="ant-table-pagination"
            total={count}
            current={page}
            pageSize={limits.solutions.list}
            onChange={this.handlePageChange}
          />
        ) : (
          <div />
        )}
      </>
    );
  }
}

export default withRouter(SolutionTable);
