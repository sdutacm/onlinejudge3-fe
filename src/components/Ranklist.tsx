import React from 'react';
import { Table } from 'antd';
import { numberToAlphabet, secToTimeStr, urlf } from '@/utils/format';
import throttle from 'lodash.throttle';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';

interface Props {
  id: number;
  data: IRanklist;
  loading: boolean;
  problemNum: number;
  userCellRender: (user: IUser) => React.ReactNode;
  needAutoUpdate: boolean;
  session: ISessionStatus;
  handleUpdate?: () => any;
  updateInterval?: number;
  existedHeaderClassName?: string,
}

interface State {
  timer: number;
  contentWidth: number;
}

class Ranklist extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      contentWidth: 0,
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

  saveViewportDimensions = throttle(() => {
    let contentWidth = window.innerWidth;
    const contentDiv = document.querySelector('.ant-layout-content');
    if (contentDiv) {
      contentWidth = contentDiv.clientWidth;
    }
    this.setState({
      contentWidth,
    });
  }, 3000);

  render() {
    const { id, data, loading, problemNum, userCellRender, existedHeaderClassName, session } = this.props;
    const { contentWidth } = this.state;
    // const contentWidth = 0;
    if (!data || !problemNum) {
      return null;
    }
    const problemIndex = Array(problemNum).fill(undefined).map((value, index) => index);
    const width = {
      rank: 64,
      user: 250,
      solved: 64,
      time: 80,
      stat: 80,
    };
    const infoWidth = width.rank + width.user +  width.solved + width.time;
    const widthSum = infoWidth + width.stat * problemNum;

    // f**k
    const docHeight = Math.max(document.documentElement.clientHeight, document.body.clientHeight);
    let availableHeight = docHeight;
    try {
      const headerHeight = document.querySelector('.ant-layout-header').clientHeight;
      const footerHeight = document.querySelector('.ant-layout-footer').clientHeight;
      const existedHeaderHeight = document.querySelector(`.${existedHeaderClassName}`).clientHeight;
      const contentMargin = 20 + 20;
      const ranklistMargin = 16;
      const ranklistTheadHeight = 45;
      availableHeight = docHeight - headerHeight - footerHeight - contentMargin - existedHeaderHeight - ranklistMargin - ranklistTheadHeight - 1;
    }
    catch (e) {}

    const canFixLeft = contentWidth > (infoWidth + width.stat) && contentWidth < widthSum;

    let ranklist = data;
    if (session.loggedIn) {
      for (const row of data) {
        if (row.user && row.user.userId === session.user.userId) {
          ranklist = [{ ...row, _self: true }, ...data];
          break;
        }
      }
    }

    return (
      <Table dataSource={ranklist}
             rowKey={(record, index) => `${record._self ? '_self' : record.user && record.user.userId}`}
             loading={loading}
             pagination={false}
             className="ranklist"
             rowClassName={(record) => record._self ? 'self-rank-row' : ''}
             scroll={{ x: contentWidth < widthSum ? widthSum : undefined, y: availableHeight }}
      >
        <Table.Column
          title="Rank"
          key="Rank"
          align={'right'}
          width={width.rank}
          fixed={canFixLeft}
          render={(text, record: IRanklistRow) => (
            <div>{record.rank}</div>
          )}
        />
        <Table.Column
          title="User"
          key="User"
          width={width.user}
          fixed={canFixLeft}
          render={(text, record: IRanklistRow) => (
            userCellRender(record.user)
          )}
        />
        <Table.Column
          title="Slv."
          key="Solved"
          align={'right'}
          width={width.solved}
          fixed={canFixLeft}
          render={(text, record: IRanklistRow) => (
            <div><Link to={urlf(pages.contests.solutions, {
              param: { id },
              query: { userId: record.user && record.user.userId }
            })}>{record.solved}</Link></div>
          )}
        />
        <Table.Column
          title="Time"
          align={'right'}
          key="Time"
          width={width.time}
          fixed={canFixLeft}
          render={(text, record: IRanklistRow) => (
            <div>{Math.floor(record.time / 60)}</div>
          )}
        />
        {problemIndex.map(index =>
          <Table.Column
            title={numberToAlphabet(index)}
            key={`prob-${index}`}
            className="stat"
            align={'center'}
            width={width.stat}
            render={(text, record: IRanklistRow) => {
              const stat = record.stats[index];
              let statText = '';
              const classList: string[] = [];
              if (stat.attempted) {
                statText = `${stat.attempted}`;
              }
              if (stat.result === 'AC' || stat.result === 'FB') {
                statText += `/${Math.floor(stat.time / 60)}`;
              }
              switch (stat.result) {
                case 'AC':
                  classList.push('accepted');
                  break;
                case 'FB':
                  classList.push('fb');
                  break;
                case 'X':
                  classList.push('failed');
                  break;
                case '?':
                  classList.push('frozen');
                  break;
              }
              return (
                <div className={classNames('stat-inner', classList)}>
                  <span>{statText}</span>
                </div>
              );
            }}
          />)}
      </Table>
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

export default Ranklist;
