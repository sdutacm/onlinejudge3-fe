import React from 'react';
import { Table, Popover, Icon, Switch, Divider } from 'antd';
import { numberToAlphabet, urlf } from '@/utils/format';
import throttle from 'lodash.throttle';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import limits from '@/configs/limits';
import router from 'umi/router';
import { withRouter } from 'react-router';
import { RouteProps } from '@/@types/props';
import { get as safeGet } from 'lodash';
import { getRatingLevel } from '@/utils/rating';
import tracker from '@/utils/tracker';
import moment from 'moment';
import { aoa2Excel } from '@/utils/misc';

const cached = {
  showAll: false,
};

export interface Props extends RouteProps {
  id: number;
  data: IRanklist;
  contest: IContest;
  loading: boolean;
  problemNum: number;
  userCellRender: (user: IUser) => React.ReactNode;
  needAutoUpdate: boolean;
  session: ISessionStatus;
  handleUpdate?: () => any;
  updateInterval?: number;
  existedHeaderClassName?: string;
  rating?: boolean;
  allowGodView?: boolean;
  godView?: boolean;
  useScore?: boolean;
  handleGodViewChange?: (god: boolean) => any;
}

interface State {
  timer: number;
  contentWidth: number;
  showAll: boolean;
}

class Ranklist extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  private exportLoading = false;

  private saveViewportDimensions = throttle(() => {
    let contentWidth = window.innerWidth;
    const contentDiv = document.querySelector('.ant-layout-content');
    if (contentDiv) {
      contentWidth = contentDiv.clientWidth;
    }
    this.setState({
      contentWidth,
    });
  }, 2000);

  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      contentWidth: 0,
      showAll: cached.showAll,
    };
  }

  checkStartUpdateTimer = (props: Props) => {
    const { needAutoUpdate, handleUpdate, updateInterval } = props;
    if (needAutoUpdate && typeof handleUpdate === 'function' && updateInterval) {
      // console.log('start timer');
      clearInterval(this.state.timer);
      const timer: any = setInterval(handleUpdate, updateInterval);
      this.setState({ timer });
    }
  };

  componentDidMount(): void {
    this.checkStartUpdateTimer(this.props);
    this.saveViewportDimensions();
    window.addEventListener('resize', this.saveViewportDimensions);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!this.props.needAutoUpdate && nextProps.needAutoUpdate) {
      this.checkStartUpdateTimer(nextProps);
    }
    if (this.props.needAutoUpdate && !nextProps.needAutoUpdate) {
      clearInterval(this.state.timer);
      // console.log('clear timer');
    }
  }

  componentWillUnmount(): void {
    clearInterval(this.state.timer);
    window.removeEventListener('resize', this.saveViewportDimensions);
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
    const tbody = document.querySelector('.ant-table-scroll>.ant-table-body');
    if (tbody) {
      tbody.scrollTo(0, 0);
    }
  };

  handleExport = async () => {
    const { id, data, contest, problemNum } = this.props;
    if (!data || !contest || this.exportLoading) {
      return;
    }
    tracker.event({
      category: 'contests',
      action: 'exportRanklist',
    });
    this.exportLoading = true;
    try {
      const problemIndex = Array(problemNum)
        .fill(undefined)
        .map((value, index) => index);
      const aoa: any[][] = [
        [
          `${contest.title} (${moment(contest.startAt).format('YYYY-MM-DD HH:mm:ss')} ~ ${moment(
            contest.endAt,
          ).format('YYYY-MM-DD HH:mm:ss')})`,
        ],
        [
          'Rank',
          'Username',
          'Nickname',
          'Score',
          'Time',
          ...problemIndex.map((pIndex) => numberToAlphabet(pIndex)),
        ],
      ];
      data.forEach((d) => {
        const row = [
          d.rank,
          d.user?.username || '',
          d.user?.nickname || '',
          d.score,
          Math.floor(d.time / 60),
        ];
        problemIndex.map((pIndex) => {
          const stat = d.stats[pIndex];
          let statText = '';
          if (stat.tries) {
            statText = `${stat.tries}`;
          }
          if (stat.result === 'AC' || stat.result === 'FB') {
            statText += `/${Math.floor(stat.time / 60)}`;
          }
          if (stat.result === 'FB') {
            statText += ' (FB)';
          }
          row.push(statText);
        });
        aoa.push(row);
      });
      console.log(aoa);
      aoa2Excel(aoa, `${moment().format('YYYY-MM-DD HH_mm_ss')} contest_ranklist_${id}.xlsx`);
    } finally {
      this.exportLoading = false;
    }
  };

  render() {
    const {
      id,
      data,
      loading,
      problemNum,
      userCellRender,
      existedHeaderClassName,
      session,
      location: { query },
      rating,
      allowGodView,
      useScore,
    } = this.props;
    const { contentWidth, showAll } = this.state;
    // const contentWidth = 0;
    if (!data || !problemNum) {
      return null;
    }
    const problemIndex = Array(problemNum)
      .fill(undefined)
      .map((value, index) => index);
    const width = {
      rank: 64,
      user: 250,
      delta: 108,
      solved: 64,
      time: 80,
      stat: 80,
    };
    const infoWidth = width.rank + width.user + width.solved + width.time;
    const widthSum = infoWidth + width.stat * problemNum;

    // f**k
    const docHeight = Math.max(document.documentElement.clientHeight, document.body.clientHeight);
    let availableHeight = docHeight;
    try {
      const headerHeight = document.querySelector('.ant-layout-header').clientHeight;
      // const footerHeight = document.querySelector('.ant-layout-footer').clientHeight;
      const footerHeight = 0;
      const existedHeaderHeight = document.querySelector(`.${existedHeaderClassName}`).clientHeight;
      const contentMargin = 20 + 20;
      const ranklistMargin = 64;
      const ranklistTheadHeight = 45;
      availableHeight =
        docHeight -
        headerHeight -
        footerHeight -
        contentMargin -
        existedHeaderHeight -
        ranklistMargin -
        ranklistTheadHeight -
        1;
    } catch (e) {}

    const canFixLeft = contentWidth > infoWidth + width.stat && contentWidth < widthSum;

    // const d = [...data];
    // d.sort(() => 0.5 - Math.random());
    let ranklist = data;
    if (session.loggedIn) {
      for (const row of data) {
        if (row.user && row.user.userId === session.user.userId) {
          ranklist = [{ ...row, _self: true }, ...data];
          break;
        }
      }
    }
    const hasRatingDelta = !!safeGet(ranklist, [0, 'user', 'newRating'], 0);

    return (
      <div>
        <Table
          dataSource={ranklist}
          rowKey={(record, index) =>
            `${record._self ? '_self' : record.user && record.user.userId}`
          }
          loading={loading}
          // pagination={false}
          className={classNames('ranklist', { 'hide-pagination': showAll })}
          rowClassName={(record) => (record._self ? 'self-rank-row' : '')}
          scroll={{
            x: contentWidth < widthSum ? widthSum : undefined,
            y: showAll ? undefined : availableHeight,
          }}
          pagination={{
            // className: 'ant-table-pagination',
            total: ranklist.length,
            current: showAll ? 1 : +query.page || 1,
            pageSize: showAll ? ranklist.length : limits.contests.ranklist,
            onChange: this.handlePageChange,
          }}
        >
          <Table.Column
            title="Rank"
            key="Rank"
            align="right"
            width={width.rank}
            fixed={canFixLeft}
            render={(text, record: IRanklistRow) => <div>{record.rank}</div>}
          />
          <Table.Column
            title="User"
            key="User"
            width={width.user}
            fixed={canFixLeft}
            render={(text, record: IRanklistRow) => userCellRender(record.user)}
          />
          {rating && hasRatingDelta && (
            <Table.Column
              title="Δ"
              key="Delta"
              width={width.delta}
              fixed={canFixLeft}
              render={(text, record: IRanklistRow) => {
                if (record.user && record.user.oldRating && record.user.newRating) {
                  const { oldRating, newRating } = record.user;
                  const oldRatingLevel = getRatingLevel(oldRating);
                  const newRatingLevel = getRatingLevel(newRating);
                  return (
                    <Popover
                      content={`Δ: ${newRating >= oldRating ? '+' : ''}${newRating - oldRating}`}
                    >
                      <span style={{ color: oldRatingLevel.color }}>{oldRating}</span>
                      <span className="ml-sm">→</span>
                      <span style={{ color: newRatingLevel.color }} className="ml-sm">
                        {newRating}
                      </span>
                    </Popover>
                  );
                }
                return null;
              }}
            />
          )}

          <Table.Column
            title="Score"
            key="Score"
            align="right"
            width={width.solved}
            fixed={canFixLeft}
            render={(text, record: IRanklistRow) => (
              <div>
                <Link
                  to={urlf(pages.contests.solutions, {
                    param: { id },
                    query: { userId: record.user && record.user.userId },
                  })}
                >
                  {record.score}
                </Link>
              </div>
            )}
          />
          <Table.Column
            title="Time"
            align="right"
            key="Time"
            width={width.time}
            fixed={canFixLeft}
            render={(text, record: IRanklistRow) => <div>{Math.floor(record.time / 60)}</div>}
          />
          {problemIndex.map((index) => (
            <Table.Column
              title={numberToAlphabet(index)}
              key={`prob-${index}`}
              className="stat"
              align="center"
              width={width.stat}
              render={(text, record: IRanklistRow) => {
                const stat = record.stats[index];
                let statText = '';
                let extraText = '';
                const classList: string[] = [];
                if (stat.tries) {
                  statText = `${stat.tries}`;
                }
                if (stat.result === 'AC' || stat.result === 'FB') {
                  statText += `/${Math.floor(stat.time / 60)}`;
                }
                if (useScore && typeof stat.score === 'number') {
                  extraText = statText;
                  statText = `${stat.score}`;
                }
                switch (stat.result) {
                  case 'AC':
                    classList.push('accepted');
                    break;
                  case 'FB':
                    classList.push('fb');
                    break;
                  case 'RJ':
                    classList.push('failed');
                    break;
                  case '?':
                    classList.push('frozen');
                    break;
                }
                return (
                  <div className={classNames('stat-inner', classList)}>
                    <div>
                      <p>{statText}</p>
                      {!!extraText && <p className="stat-inner-extra">{extraText}</p>}
                    </div>
                  </div>
                );
              }}
            />
          ))}
        </Table>
        {!loading && data && (
          <span>
            <span
              style={{
                position: 'absolute',
                bottom: '16px',
                lineHeight: '32px',
                marginLeft: '16px',
              }}
            >
              <Popover content="Show all in one page. May cause performance issues">
                Show All
              </Popover>
              <Switch
                size="small"
                className="ml-md"
                checked={showAll}
                onChange={(checked) => {
                  this.setState({ showAll: checked });
                  cached.showAll = checked;
                }}
              />
            </span>
            <a
              className="normal-text-link"
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '108px',
                lineHeight: '32px',
                marginLeft: '36px',
              }}
              onClick={this.handleExport}
            >
              Export Ranklist
            </a>
            {allowGodView && (
              <span
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '240px',
                  lineHeight: '32px',
                  marginLeft: '36px',
                }}
              >
                <Popover content="Switch God View">God View</Popover>
                <Switch
                  size="small"
                  className="ml-md"
                  defaultChecked={!!this.props.godView}
                  onChange={(checked) => {
                    this.props.handleGodViewChange?.(checked);
                  }}
                />
              </span>
            )}
          </span>
        )}
      </div>
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

export default withRouter(Ranklist);
