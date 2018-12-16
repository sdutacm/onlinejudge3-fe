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
import { Table, Popover, Pagination, Icon } from 'antd';
import classNames from 'classnames';
import { Results } from '@/configs/results';

interface Props extends ReduxProps, RouteProps {
  loading: boolean;
  data: List<Solution>;
  showPagination: boolean;
  isDetail: boolean;
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
        type: this.props.isDetail ? 'one' : 'list',
        solutionIds,
      },
    });
  };

  handleChangePage = page => {
    router.push({
      pathname: pages.solutions.index,
      query: { ...this.props.location.query, page },
    });
  };

  render() {
    const { loading, data: { page, count, rows }, showPagination, isDetail } = this.props;
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
                 return {
                   onClick: () => !this.props.isDetail && router.push(urlf(pages.solutions.one, { param: { id: record.solutionId } }))
                 };
               }}
        >
          {isDetail && <Table.Column
            title="ID"
            key="ID"
            render={(text, record: Solution) => (
              <span>{record.solutionId}</span>
            )}
          />}
          <Table.Column
            title="User"
            key="User"
            render={(text, record: Solution) => (
              <UserBar user={record.user} />
            )}
          />
          <Table.Column
            title={'Prob.'}
            key="Problem"
            render={(text, record: Solution) => (
              <Popover content={record.problem.title}>
                <Link to={urlf(pages.problems.one, { param: { id: record.problem.problemId } })}
                      onClick={e => e.stopPropagation()}>{record.problem.problemId}</Link>
              </Popover>
            )}
          />
          <Table.Column
            title="Res."
            key="Result"
            dataIndex="solutionId"
            className="result-bar"
            render={(text, record: Solution) => (
              <ResultBar percent={0} timeLimit={record.problem.timeLimit} result={record.result} />
            )}
          />
          <Table.Column
            title="Time"
            key="Time"
            className="near-result-bar"
            render={(text, record: Solution) => (
              <span>{record.time}</span>
            )}
          />
          <Table.Column
            title={'Mem.'}
            key="Memory"
            render={(text, record: Solution) => (
              <span>{record.memory}</span>
            )}
          />
          <Table.Column
            title={'Len.'}
            key="Length"
            render={(text, record: Solution) => (
              <span>{record.codeLength}</span>
            )}
          />
          <Table.Column
            title={'Lang.'}
            key="Language"
            render={(text, record: Solution) => (
              <span>{langsMap[record.language].displayShortName}</span>
            )}
          />
          <Table.Column
            title="At"
            key="At"
            render={(text, record: Solution) => (
              <TimeBar time={record.createdAt * 1000} />
            )}
          />
          {!isDetail && <Table.Column
            title=""
            key=""
            className="float-btn"
            render={(text, record: Solution) => (
              <Link to={urlf(pages.solutions.one, { param: { id: record.solutionId } })}
                    onClick={e => e.stopPropagation()}>
                <Icon type="ellipsis" theme="outlined" />
              </Link>
            )}
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
