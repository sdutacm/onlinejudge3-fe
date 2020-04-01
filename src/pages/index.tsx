import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { Row, Col, Card, Table, Icon, Popover } from 'antd';
import UserBar from '@/components/UserBar';
import constants from '@/configs/constants';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import moment from 'moment';
import { toLongTs, urlf } from '@/utils/format';
import classNames from 'classnames';
import { ContestTypes } from '@/configs/contestTypes';
import TimeStatusBadge from '@/components/TimeStatusBadge';
import gStyles from '@/general.less';
import PageTitle from '@/components/PageTitle';

const TOP_NUM = 5;
let cachedState = {
  recentContests: {
    page: 1,
    count: 0,
    limit: 0,
    rows: [],
  },
};

interface Props extends ReduxProps, RouteProps {
  userACRank: {
    day: IStatsUserACRank;
    week: IStatsUserACRank;
    month: IStatsUserACRank;
  };
  userACRankloading: boolean;
  recentContestsLoading: boolean;
}

interface State {
  recentContests: IList<IContest>;
}

class Index extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...cachedState,
    };
  }

  async componentDidMount() {
    const ret = await this.props.dispatch({
      type: 'contests/getListData',
      payload: {
        limit: 3,
        category: '0',
      },
    });
    if (ret.success) {
      this.setState({
        recentContests: ret.data,
      });
    }
  }

  componentWillUnmount() {
    cachedState = {
      ...this.state,
    };
  }

  render() {
    const { userACRank, userACRankloading, recentContestsLoading } = this.props;
    const { recentContests } = this.state;
    const serverTime = Date.now() - ((window as any)._t_diff || 0);

    return (
      <PageAnimation>
        <PageTitle title={null}>
          <Row gutter={16} className="content-view-lg mb-xl">
            <Col xs={24} className="mt-lg">
              <h1 className="full-width-inner-content mb-sm">{constants.siteTitle}</h1>
              <p className="full-width-inner-content text-para" style={{ fontSize: '20px' }}>
                Practice coding, compete with players, and become a master.
              </p>
            </Col>

            <Col xs={24} className="mt-xl">
              <h3 className="full-width-inner-content">Recent Contests</h3>
              <Card bordered={false} className="list-card">
                <Table
                  dataSource={recentContests.rows}
                  rowKey={(record: IContest) => `${record.contestId}`}
                  loading={recentContestsLoading}
                  pagination={false}
                  className="responsive-table"
                >
                  <Table.Column
                    title=""
                    key="Type"
                    className="text-right td-icon"
                    render={(text, record: IContest) => (
                      <span>
                        {record.type === ContestTypes.Private && <Icon type="lock" />}
                        {record.type === ContestTypes.Register && <Icon type="team" />}
                      </span>
                    )}
                  />
                  <Table.Column
                    title="Title"
                    key="Title"
                    render={(text, record: IContest) => (
                      <Link to={urlf(pages.contests.home, { param: { id: record.contestId } })}>
                        {record.title}
                      </Link>
                    )}
                  />
                  <Table.Column
                    title="Time"
                    key="Time"
                    render={(text, record: any) => (
                      <Popover
                        content={
                          <table>
                            <tbody>
                              <tr>
                                <td className={classNames(gStyles.textRight, gStyles.textBold)}>
                                  Start:
                                </td>
                                <td>
                                  {moment(toLongTs(record.startAt)).format('YYYY-MM-DD HH:mm:ss Z')}{' '}
                                  ({moment(toLongTs(record.startAt)).from(serverTime)})
                                </td>
                              </tr>
                              <tr>
                                <td className={classNames(gStyles.textRight, gStyles.textBold)}>
                                  End:
                                </td>
                                <td>
                                  {moment(toLongTs(record.endAt)).format('YYYY-MM-DD HH:mm:ss Z')} (
                                  {moment(toLongTs(record.endAt)).from(serverTime)})
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        }
                      >
                        <span>
                          {moment(toLongTs(record.startAt)).format('YYYY-MM-DD HH:mm')} ~{' '}
                          {moment(toLongTs(record.endAt)).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </Popover>
                    )}
                  />
                  <Table.Column
                    title="Status"
                    key="status"
                    render={(text, record: any) => (
                      <TimeStatusBadge
                        start={toLongTs(record.startAt)}
                        end={toLongTs(record.endAt)}
                        cur={serverTime}
                      />
                    )}
                  ></Table.Column>
                </Table>
              </Card>
            </Col>

            {['month', 'week', 'day'].map((type: 'day' | 'week' | 'month') => {
              const data = userACRank[type];
              const rankNameMap = {
                day: (
                  <span>
                    <Icon type="crown" theme="filled" /> DAILY TOP {TOP_NUM}
                  </span>
                ),
                week: (
                  <span>
                    <Icon type="crown" theme="filled" /> WEEKLY TOP {TOP_NUM}
                  </span>
                ),
                month: (
                  <span>
                    <Icon type="crown" theme="filled" /> MONTHLY TOP {TOP_NUM}
                  </span>
                ),
              };
              return (
                <Col xs={24} md={8} key={type} className="mt-xl">
                  <h3 className="full-width-inner-content">{rankNameMap[type]}</h3>
                  <Card bordered={false} className="list-card">
                    <Table
                      dataSource={data.rows.slice(0, TOP_NUM)}
                      rowKey={(record: IStatsUserACRankUserStatus) =>
                        `${record.user && record.user.userId}`
                      }
                      loading={userACRankloading}
                      pagination={false}
                      className="responsive-table"
                    >
                      <Table.Column
                        title="User"
                        key="User"
                        render={(text, record: IStatsUserACRankUserStatus) => (
                          <UserBar user={record.user} />
                        )}
                      />
                      <Table.Column
                        title="AC"
                        key="Accepted"
                        render={(text, record: IStatsUserACRankUserStatus) => (
                          <span>{record.accepted}</span>
                        )}
                      />
                    </Table>
                  </Card>
                  {data._updatedAt > 0 && (
                    <p
                      className="full-width-inner-content text-secondary text-right mt-sm-md"
                      style={{ fontSize: '12px' }}
                    >
                      updated {moment(data._updatedAt).fromNow()}
                    </p>
                  )}
                </Col>
              );
            })}
          </Row>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    userACRank: state.stats.userACRank,
    userACRankloading: !!state.loading.effects['stats/getAllUserACRank'],
    recentContestsLoading: !!state.loading.effects['contests/getListData'],
  };
}

export default connect(mapStateToProps)(Index);
