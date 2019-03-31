import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Tabs, Popover, Icon, Form, Switch } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { toLongTs, urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import ToDetailCard from '@/components/ToDetailCard';
import { Link } from 'react-router-dom';
import contestTypes, { ContestTypes } from '@/configs/contestTypes';
import gStyles from '@/general.less';
import TimeStatusBadge from '@/components/TimeStatusBadge';
import classNames from 'classnames';
import moment from 'moment';
import constants from '@/configs/constants';
import PageTitle from '@/components/PageTitle';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends ReduxProps, RouteProps {
  data: IList<IContest>;
  session: ISessionStatus;
}

interface State {
}

class ContestList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (this.props.session.loggedIn && !nextProps.session.loggedIn &&
      nextProps.location.query.joined) {
      router.replace({
        pathname: this.props.location.pathname,
        query: { ...this.props.location.query, joined: undefined, page: 1 },
      });
    }
  }

  handlePageChange = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleCategoryChange = category => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, category: category, page: 1 },
    });
  };

  handleJoinedChange = joined => {
    setTimeout(() => router.replace({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, joined: joined || undefined, page: 1 },
    }), constants.switchAnimationDuration);
  };

  render() {
    const { loading, data: { page, count, rows }, location: { query }, session } = this.props;
    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    return (
      <PageAnimation>
        <PageTitle title={+query.category === 1 ? 'Experiments' : 'Contests'}>
          <Row gutter={16}>
            <Col xs={24}>
              <Tabs defaultActiveKey={query.category} activeKey={query.category} animated={false} onChange={this.handleCategoryChange}>
                <Tabs.TabPane tab="Contests" key="0" />
                <Tabs.TabPane tab="Experiments" key="1" />
              </Tabs>
            </Col>
            <Col xs={24} md={18} xxl={20}>
              <Card bordered={false} className="list-card">
                <Table
                  dataSource={rows}
                  rowKey="contestId"
                  loading={loading}
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
                      <Link to={urlf(pages.contests.home, { param: { id: record.contestId } })}>{record.title}</Link>
                    )}
                  />
                  <Table.Column
                    title="Time"
                    key="Time"
                    render={(text, record: any) => (
                      <Popover content={(
                        <table>
                          <tbody>
                            <tr>
                              <td className={classNames(gStyles.textRight, gStyles.textBold)}>Start:</td>
                              <td>{moment(toLongTs(record.startAt)).format('YYYY-MM-DD HH:mm:ss Z')} ({moment(toLongTs(record.startAt)).from(serverTime)})</td>
                            </tr>
                            <tr>
                              <td className={classNames(gStyles.textRight, gStyles.textBold)}>End:</td>
                              <td>{moment(toLongTs(record.endAt)).format('YYYY-MM-DD HH:mm:ss Z')} ({moment(toLongTs(record.endAt)).from(serverTime)})</td>
                            </tr>
                          </tbody>
                        </table>
                      )}>
                        <span>{moment(toLongTs(record.startAt)).format('YYYY-MM-DD HH:mm')} ~ {moment(toLongTs(record.endAt)).format('YYYY-MM-DD HH:mm')}</span>
                      </Popover>
                    )}
                  />
                  <Table.Column
                    title="Status"
                    key="status"
                    render={(text, record: any) => (
                      <TimeStatusBadge start={toLongTs(record.startAt)} end={toLongTs(record.endAt)} cur={serverTime} />
                    )}
                  >
                  </Table.Column>
                </Table>
                <Pagination
                  className="ant-table-pagination"
                  total={count}
                  current={page}
                  pageSize={limits.contests.list}
                  onChange={this.handlePageChange}
                />
              </Card>
            </Col>
            <Col xs={24} md={6} xxl={4}>
              <Card bordered={false}>
                <ToDetailCard
                  label="Go to Contest" placeholder="Contest ID"
                  toDetailLink={id => urlf(pages.contests.home, { param: { id } })}
                />
              </Card>
              <Card bordered={false}>
                <FilterCard fields={[
                  { displayName: 'Title', fieldName: 'title' },
                  {
                    displayName: 'Type', fieldName: 'type', options: contestTypes.map(res => {
                      return { fieldName: res.id, displayName: res.name };
                    }),
                  },
                ]} initQuery={{ category: query.category }} />
              </Card>
              {session.loggedIn &&
              <Card bordered={false}>
                <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
                  <Form.Item className="single-form-item" label={
                    <div>
                      <span className="title">My Joined Contests</span>
                      <div className="float-right">
                        <Switch defaultChecked={!!query.joined} onChange={this.handleJoinedChange} loading={loading} />
                      </div>
                    </div>
                  } />
                </Form>
              </Card>}
            </Col>
          </Row>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['contests/getList'],
    data: state.contests.list,
    session: state.session,
  };
}

export default connect(mapStateToProps)(ContestList);
