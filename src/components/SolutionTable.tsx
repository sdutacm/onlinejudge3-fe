import React from 'react';
import { withRouter } from 'react-router';
import pages from '@/configs/pages';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import { ReduxProps, RouteProps } from '@/@types/props';
import { numberToAlphabet, urlf } from '@/utils/format';
import UserBar from '@/components/UserBar';
import ResultBar from '@/components/ResultBar';
import { langsMap } from '@/configs/solutionLanguages';
import TimeBar from '@/components/TimeBar';
import limits from '@/configs/limits';
import { Table, Popover, Pagination, Icon } from 'antd';
import classNames from 'classnames';
import { Results } from '@/configs/results';
import { ContestTypes } from '@/configs/contestTypes';

interface Props extends ReduxProps, RouteProps {
  loading: boolean;
  data: List<ISolution>;
  showPagination: boolean;
  isDetail: boolean;
  contestId?: number;
  problemList?: any[];
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

  updatePendingSolutions = () => {
    const { rows } = this.props.data;
    const solutionIds: number[] = [];
    for (const row of rows) {
      if (row.result === Results.WT || row.result === Results.JG) {
        solutionIds.unshift(row.solutionId);
      }
    }
    solutionIds.length && this.props.dispatch({
      type: 'solutions/getListByIds',
      payload: {
        type: this.props.isDetail ? 'detail' : 'list',
        solutionIds,
      },
    });
  };

  handleChangePage = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  render() {
    const {
      loading,
      data: { page, count, rows },
      showPagination,
      isDetail,
      contestId,
      problemList,
    } = this.props;
    return (
      <>
        <Table dataSource={rows}
               rowKey="solutionId"
               loading={loading}
               pagination={false}
               className={classNames(
                 'responsive-table',
                 {
                   'click-table': !isDetail,
                   'single-row-table': isDetail,
                 }
               )}
               onRow={(record) => {
                 const solutionDetailUrl = contestId
                   ? urlf(pages.contests.solutionDetail, { param: { id: contestId, sid: record.solutionId } })
                   : urlf(pages.solutions.detail, { param: { id: record.solutionId } });
                 return {
                   onClick: () => !this.props.isDetail && router.push(solutionDetailUrl)
                 };
               }}
        >
          {isDetail && <Table.Column
            title="ID"
            key="ID"
            render={(text, record: ISolution) => (
              <span>{record.solutionId}</span>
            )}
          />}
          <Table.Column
            title="User"
            key="User"
            render={(text, record: ISolution) => (
              <UserBar user={record.user} isContestUser={record.contest && record.contest.type === ContestTypes.Register} />
            )}
          />
          <Table.Column
            title={'Prob.'}
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
              const problemDetailUrl = contestId && contestProblem
                ? urlf(pages.contests.problemDetail, { param: { id: contestId, index: contestProblem.index } })
                : urlf(pages.problems.detail, { param: { id: record.problem.problemId } });
              return (
                <Popover content={contestProblem ? contestProblem.title : record.problem.title}>
                  <Link to={problemDetailUrl} onClick={e => e.stopPropagation()}>
                    {contestProblem ? numberToAlphabet(contestProblem.index) : record.problem.problemId}
                  </Link>
                </Popover>
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
            render={(text, record: ISolution) => (
              <span>{record.time}</span>
            )}
          />
          <Table.Column
            title={'Mem.'}
            key="Memory"
            render={(text, record: ISolution) => (
              <span>{record.memory}</span>
            )}
          />
          <Table.Column
            title={'Len.'}
            key="Length"
            render={(text, record: ISolution) => (
              <span>{record.codeLength}</span>
            )}
          />
          <Table.Column
            title={'Lang.'}
            key="Language"
            render={(text, record: ISolution) => (
              <span>{langsMap[record.language].displayShortName}</span>
            )}
          />
          <Table.Column
            title="At"
            key="At"
            render={(text, record: ISolution) => (
              <TimeBar time={record.createdAt * 1000} />
            )}
          />
          {!isDetail && <Table.Column
            title=""
            key=""
            className="float-btn"
            render={(text, record: ISolution) => {
              const solutionDetailUrl = contestId
                ? urlf(pages.contests.solutionDetail, { param: { id: contestId, sid: record.solutionId } })
                : urlf(pages.solutions.detail, { param: { id: record.solutionId } });
              return (
                <Link to={solutionDetailUrl}
                      onClick={e => e.stopPropagation()}>
                  <Icon type="ellipsis" theme="outlined" />
                </Link>
              );
            }}
          />}
        </Table>
        {showPagination ? <Pagination
          className="ant-table-pagination"
          total={count}
          current={page}
          pageSize={limits.solutions.list}
          onChange={this.handleChangePage}
        /> : <div />}
      </>
    );
  }
}

export default withRouter(SolutionTable);
