import React from 'react';
import { Table, Icon } from 'antd';
import { urlf } from '@/utils/format';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import limits from '@/configs/limits';
import router from 'umi/router';
import { withRouter } from 'react-router';
import { RouteProps } from '@/@types/props';
import UserBar from './UserBar';
import moment from 'moment';
import { aoa2Excel } from '@/utils/misc';
import { memoize } from '@/utils/decorators';
import tracker from '@/utils/tracker';

export interface Props extends RouteProps {
  id: number;
  title: string;
  data: ISetStatsRanklist;
  dataUpdatedAt?: number;
  sections: ISetPropsTypeStandard['sections'];
  loading: boolean;
  showDetail?: boolean;
}

interface State {}

class StatsRanklist extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    showDetail: false,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdate(np: Readonly<Props>, ns: Readonly<Props>) {
    const p = this.props;
    if (
      p.id === np.id &&
      p.title === np.title &&
      p.data === np.data &&
      p.dataUpdatedAt === np.dataUpdatedAt &&
      p.sections === np.sections &&
      p.loading === np.loading &&
      p.showDetail === np.showDetail &&
      p.location === np.location
    ) {
      return false;
    }
    return true;
  }

  @memoize
  flatProblemsImpl(sections: ISetPropsTypeStandard['sections']) {
    const flatProblems: {
      id: string;
      problemId: number;
      title: string;
    }[] = [];
    sections.forEach((section, sectionIndex) => {
      section.problems.forEach((problem, problemIndex) =>
        flatProblems.push({
          id: `${sectionIndex + 1}-${problemIndex + 1}`,
          ...problem,
        }),
      );
    });
    return flatProblems;
  }

  get flatProblems() {
    return this.flatProblemsImpl(this.props.sections);
  }

  handlePageChange = (page) => {
    const { query } = this.props.location;
    if (+query.page !== +page) {
      router.push({
        pathname: this.props.location.pathname,
        query: { ...this.props.location.query, page },
      });
    }
  };

  handleExport = () => {
    const { id, title, loading, data } = this.props;
    if (loading) {
      return;
    }
    tracker.event({
      category: 'sets',
      action: 'exportStatsRanklist',
    });
    const aoa: any[][] = [
      [
        'Rank',
        'Username',
        'Nickname',
        'Solved',
        'Total',
        'Progress',
        ...this.flatProblems.map((p) => p.id),
      ],
    ];
    for (const d of data) {
      aoa.push([
        d.rank,
        d.user.username,
        d.user.nickname,
        d.stats.solved,
        this.flatProblems.length,
        (d.stats.solved / this.flatProblems.length).toFixed(2),
        ...this.flatProblems.map((p) => (d.stats.acceptedProblemsMap.has(p.problemId) ? '✓' : '')),
      ]);
    }
    aoa2Excel(aoa, `${moment().format('YYYY-MM-DD')} ${id}_${title} - Stats.xlsx`, `Stats`);
  };

  render() {
    const {
      id,
      data,
      dataUpdatedAt,
      sections,
      loading,
      showDetail,
      location: { query },
    } = this.props;
    // const contentWidth = 0;
    if (!id || !data || !sections) {
      return null;
    }

    return (
      <>
        <div className="ml-lg mt-lg mb-md">
          <a className="normal-text-link" onClick={this.handleExport}>
            <Icon type="download" /> Export
          </a>
        </div>
        <Table
          dataSource={data}
          rowKey={(record) => `${record.user.userId}`}
          loading={loading}
          className="table-pagination-left _id_stats-ranklist"
          // pagination={false}
          // className="ranklist"
          // rowClassName={(record) => (record._self ? 'self-rank-row' : '')}
          pagination={{
            // className: 'ant-table-pagination',
            total: data.length,
            current: +query.page || 1,
            pageSize: limits.sets.stats,
            onChange: this.handlePageChange,
          }}
        >
          <Table.Column
            title="Rank"
            key="Rank"
            align="right"
            // width={50}
            // fixed={canFixLeft}
            render={(text, record: ISetStatsRanklistRow) => <div>{record.rank}</div>}
          />
          <Table.Column
            title="User"
            key="User"
            // width={200}
            // fixed={canFixLeft}
            render={(text, record: ISetStatsRanklistRow) => <UserBar user={record.user} />}
          />

          <Table.Column
            title="Solved"
            key="Solved"
            className="nowrap"
            // width={80}
            // width={width.solved}
            // fixed={canFixLeft}
            render={(text, record: ISetStatsRanklistRow) => (
              <div>
                {record.stats.solved}{' '}
                {record.stats.solved
                  ? `(${Math.floor((record.stats.solved / this.flatProblems.length) * 100)}%)`
                  : ''}
              </div>
            )}
          />
          {showDetail &&
            this.flatProblems.map((problem) => (
              <Table.Column
                title={problem.id}
                key={problem.id}
                // className="stat"
                align="center"
                className="nowrap"
                // width={50}
                render={(text, record: ISetStatsRanklistRow) => {
                  const info = record.stats.acceptedProblemsMap.get(problem.problemId);
                  if (!info) {
                    return;
                  }
                  return (
                    <Link
                      to={urlf(pages.solutions.index, {
                        query: { problemId: problem.problemId, userId: record.user.userId },
                      })}
                    >
                      <div>
                        <Icon type="check" className="text-success" />
                      </div>
                    </Link>
                  );
                }}
              />
            ))}
        </Table>

        {dataUpdatedAt ? (
          <p className="ml-lg mt-md mb-lg text-secondary">
            Data last updated at {moment(dataUpdatedAt).format('YYYY-MM-DD HH:mm:ss Z')}
          </p>
        ) : null}
      </>
    );
    // return (
    //   <div className="ant-table-wrapper responsive-table">
    //     <div className="ant-table ant-table-default ant-table-scroll-position-left">
    //       <div className="ant-table-content">
    //         <div className="ant-table-body">
    //           <table>
    //             <thead className="ant-table-thead">
    //             <tr>
    //               <th>Rank</th>
    //               <th>User</th>
    //               <th>Slv.</th>
    //               <th>Time</th>
    //               {problemHeader}
    //             </tr>
    //             </thead>
    //             <tbody className="ant-table-tbody">
    //             {data.map(row => {
    //               return (
    //                 <tr key={row.user.userId}>
    //                   <td>{row.rank}</td>
    //                   <td>{userCellRender(row.user)}</td>
    //                   <td>{row.solved}</td>
    //                   <td>{row.time + '1111111111111111111111111111111111111111111111111111111111'}</td>
    //                   {row.stats.map((stat, index) => {
    //                     return (
    //                       <td key={`${row.user.userId}-${index}`}>{stat.result}</td>
    //                     );
    //                   })}
    //                 </tr>
    //               );
    //             })}
    //             </tbody>
    //           </table>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}

export default withRouter(StatsRanklist);
