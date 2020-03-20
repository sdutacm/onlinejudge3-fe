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
import { workbook2Excel } from '@/utils/misc';
import XLSX from 'xlsx';
import { memoize } from '@/utils/decorators';
import tracker from '@/utils/tracker';
import { isEqual, pick } from 'lodash';

export interface Props extends RouteProps {
  id: number;
  title: string;
  sections: ISetPropsTypeStandard['sections'];
  data: ISetStatsRanklist;
  uaspUpdatedAt?: number;
  selectedEndAt?: moment.Moment;
  selectedSection: number | '$all';
  loading: boolean;
  showDetail?: boolean;
  calcStatsPerGroup?: () => ISetStatsGroupRanklist[];
}

interface State {}

class StatsRanklist extends React.Component<Props, State> {
  private exportLoading = false;

  static defaultProps: Partial<Props> = {
    showDetail: false,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  shouldComponentUpdate(np: Readonly<Props>, ns: Readonly<Props>) {
    const p = this.props;
    const compProps: Array<keyof Props | 'location.query'> = [
      'id',
      'title',
      'sections',
      'data',
      'uaspUpdatedAt',
      'selectedEndAt',
      'selectedSection',
      'loading',
      'showDetail',
      'location.query',
    ];
    return !isEqual(pick(p, compProps), pick(np, compProps));
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

  @memoize
  flatProblemsInSelectedSectionImpl(
    sections: ISetPropsTypeStandard['sections'],
    sectionIndex: number,
  ) {
    const flatProblems: {
      id: string;
      problemId: number;
      title: string;
    }[] = [];
    sections[sectionIndex].problems.forEach((problem, problemIndex) =>
      flatProblems.push({
        id: `${sectionIndex + 1}-${problemIndex + 1}`,
        ...problem,
      }),
    );
    return flatProblems;
  }

  get flatProblemsInSelectedSection() {
    if (this.props.selectedSection !== '$all') {
      return this.flatProblemsInSelectedSectionImpl(
        this.props.sections,
        this.props.selectedSection,
      );
    }
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

  getUserProblemStatWording = (stats?: { accepted: boolean; attempted?: number }) => {
    if (!stats) {
      return '';
    }
    if (stats.accepted) {
      return '✓';
    }
    if (stats.attempted) {
      return `-${stats.attempted}`;
    }
    return '';
  };

  handleExport = () => {
    const {
      id,
      title,
      sections,
      data: totalRanklist,
      uaspUpdatedAt,
      selectedEndAt,
      loading,
      calcStatsPerGroup,
    } = this.props;
    if (loading || this.exportLoading) {
      return;
    }
    tracker.event({
      category: 'sets',
      action: 'exportStatsRanklist',
    });
    this.setState({
      exportLoading: true,
    });
    const groupRanklists = calcStatsPerGroup?.() || [];
    const ranklists = [
      {
        sheetName: 'Statistics',
        data: totalRanklist,
      },
      ...groupRanklists.map((gr) => ({
        sheetName: gr.name,
        data: gr.ranklist,
      })),
    ];
    try {
      let until: moment.Moment | null = moment(uaspUpdatedAt);
      if (selectedEndAt?.isBefore(uaspUpdatedAt)) {
        until = selectedEndAt;
      }
      const workbook = {
        SheetNames: [],
        Sheets: {},
      };
      for (const ranklist of ranklists) {
        const { sheetName, data } = ranklist;
        const aoa: any[][] = [
          [
            `${moment(until).format('YYYY-MM-DD HH:mm:ss')}  ${title} (${sections.length} section${
              sections.length > 1 ? 's' : ''
            }, ${this.flatProblems.length} problem${this.flatProblems.length > 1 ? 's' : ''})`,
          ],
          [
            'Rank',
            'Username',
            'Nickname',
            'Solved',
            'Progress',
            ...sections.map((section, sectionIndex) => `S${sectionIndex + 1}: ${section.title}`),
            ...this.flatProblems.map((p) => p.id),
          ],
        ];
        for (const d of data) {
          aoa.push([
            d.rank,
            d.user.username,
            d.user.nickname,
            d.stats.solved,
            (d.stats.solved / this.flatProblems.length).toFixed(2),
            ...sections.map((section) => {
              return section.problems.reduce(
                (acc, cur) => acc + (d.stats.problemsStatsMap.has(cur.problemId) ? 1 : 0),
                0,
              );
            }),
            ...this.flatProblems.map((p) =>
              this.getUserProblemStatWording(d.stats.problemsStatsMap.get(p.problemId)),
            ),
          ]);
        }
        const sheet = XLSX.utils.aoa_to_sheet(aoa);
        const commonHeaderMerges = [
          {
            s: { r: 0, c: 0 },
            e: { r: 0, c: aoa[1].length - 1 },
          },
        ];
        const commonHeaderWidth = [{ wch: 8 }, { wch: 20 }, { wch: 20 }];
        sheet['!merges'] = commonHeaderMerges;
        sheet['!cols'] = commonHeaderWidth;
        workbook.SheetNames.push(sheetName);
        workbook.Sheets[sheetName] = sheet;
      }

      workbook2Excel(
        workbook,
        `Until ${moment(until).format('YYYY-MM-DD HH_mm_ss')} set-${id}_${title} (${
          sections.length
        }s ${this.flatProblems.length}p).xlsx`,
      );
    } catch (e) {
      console.error(e);
    } finally {
      this.exportLoading = false;
    }
  };

  render() {
    const {
      id,
      data,
      uaspUpdatedAt,
      sections,
      loading,
      showDetail,
      location: { query, pathname },
    } = this.props;
    // const contentWidth = 0;
    if (!id || !data || !sections) {
      return null;
    }

    return (
      <>
        <div className="ml-lg mt-lg mb-md">
          <a className="normal-text-link" onClick={this.handleExport}>
            <Icon type="export" /> Export Statistics
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
            render={(text, record: ISetStatsRanklistRow) => {
              const solved = record.stats.solved;
              const total = this.flatProblemsInSelectedSection.length;
              return (
                <div>
                  {solved} / {total} {solved ? `(${Math.floor((solved / total) * 100)}%)` : ''}
                </div>
              );
            }}
          />
          {showDetail &&
            this.flatProblemsInSelectedSection.map((problem) => (
              <Table.Column
                title={problem.id}
                key={problem.id}
                // className="stat"
                align="center"
                className="nowrap"
                // width={50}
                render={(text, record: ISetStatsRanklistRow) => {
                  const info = record.stats.problemsStatsMap.get(problem.problemId);
                  if (!info) {
                    return null;
                  }
                  if (info.accepted) {
                    return (
                      <Link
                        to={urlf(pages.solutions.index, {
                          query: {
                            problemId: problem.problemId,
                            userId: record.user.userId,
                            from: pathname,
                          },
                        })}
                      >
                        <div>
                          <Icon type="check" className="text-success" />
                        </div>
                      </Link>
                    );
                  }
                  if (info.attempted) {
                    return (
                      <Link
                        to={urlf(pages.solutions.index, {
                          query: {
                            problemId: problem.problemId,
                            userId: record.user.userId,
                            from: pathname,
                          },
                        })}
                      >
                        <div className="text-danger">-{info.attempted}</div>
                      </Link>
                    );
                  }
                  return null;
                }}
              />
            ))}
        </Table>

        {uaspUpdatedAt ? (
          <div className="ml-lg mr-lg mt-md mb-lg text-secondary">
            Data last updated at {moment(uaspUpdatedAt).format('YYYY-MM-DD HH:mm:ss Z')}
          </div>
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
