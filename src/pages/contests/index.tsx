import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Tabs, Popover, Icon, Form, Switch, Button } from 'antd';
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
import GeneralFormModal from '@/components/GeneralFormModal';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps, RouteProps {
  data: IList<IContest>;
  session: ISessionStatus;
  proMode: boolean;
}

interface State {}

class ContestList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  get categoryName() {
    const {
      location: { query },
    } = this.props;
    switch (+query.category) {
      case 2:
        return 'Tests';
      case 1:
        return 'Experiments';
      default:
        return 'Contests';
    }
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (
      this.props.session.loggedIn &&
      !nextProps.session.loggedIn &&
      nextProps.location.query.joined
    ) {
      router.replace({
        pathname: this.props.location.pathname,
        query: { ...this.props.location.query, joined: undefined, page: 1 },
      });
    }
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleCategoryChange = (category) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, category: category, page: 1 },
    });
  };

  handleJoinedChange = (joined) => {
    tracker.event({
      category: 'contests',
      action: 'switchOwn',
    });
    setTimeout(
      () =>
        router.replace({
          pathname: this.props.location.pathname,
          query: { ...this.props.location.query, joined: joined || undefined, page: 1 },
        }),
      constants.switchAnimationDuration,
    );
  };

  canRegister = (registerStartAt: ITimestamp, registerEndAt: ITimestamp) => {
    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    return (
      this.props.session.loggedIn &&
      registerStartAt * 1000 <= serverTime &&
      serverTime < registerEndAt * 1000
    );
  };

  clothingSize = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  formList = [
    'schoolNo',
    'name',
    'school',
    'college',
    'major',
    'class',
    'tel',
    'email',
    'clothing',
  ];

  render() {
    let addUserFormItems = [
      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        rules: [{ required: true, message: 'Please input nickname' }],
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        rules: [{ required: true, message: 'Please input password' }],
      },
      {
        name: 'Unofficial Participation',
        field: 'unofficial',
        component: 'select',
        initialValue: 'false',
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Name',
        field: 'name1',
        component: 'input',
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No.',
        field: 'schoolNo1',
        component: 'input',
      },
      {
        name: 'School',
        field: 'school1',
        component: 'input',
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College',
        field: 'college1',
        component: 'input',
      },
      {
        name: 'Major',
        field: 'major1',
        component: 'input',
      },
      {
        name: 'Class',
        field: 'class1',
        component: 'input',
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel',
        field: 'tel1',
        component: 'input',
      },
      {
        name: 'Email',
        field: 'email1',
        component: 'input',
        rules: [{ required: true, message: 'Please input email' }],
      },
      {
        name: 'Clothing Size',
        field: 'clothing1',
        component: 'select',
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
    ];
    let addTeamUserFormItems = [
      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        rules: [{ required: true, message: 'Please input nickname' }],
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        rules: [{ required: true, message: 'Please input password' }],
      },
      {
        name: 'Unofficial Participation',
        field: 'unofficial',
        component: 'select',
        initialValue: 'false',
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Name of Member 1',
        field: 'name1',
        component: 'input',
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 1',
        field: 'schoolNo1',
        component: 'input',
      },
      {
        name: 'School of Member 1',
        field: 'school1',
        component: 'input',
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 1',
        field: 'college1',
        component: 'input',
      },
      {
        name: 'Major of Member 1',
        field: 'major1',
        component: 'input',
      },
      {
        name: 'Class of Member 1',
        field: 'class1',
        component: 'input',
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 1',
        field: 'tel1',
        component: 'input',
      },
      {
        name: 'Email of Member 1',
        field: 'email1',
        component: 'input',
        rules: [{ required: true, message: 'Please input email' }],
      },
      {
        name: 'Clothing Size of Member 1',
        field: 'clothing1',
        component: 'select',
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 2',
        field: 'name2',
        component: 'input',
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 2',
        field: 'schoolNo2',
        component: 'input',
      },
      {
        name: 'School of Member 2',
        field: 'school2',
        component: 'input',
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 2',
        field: 'college2',
        component: 'input',
      },
      {
        name: 'Major of Member 2',
        field: 'major2',
        component: 'input',
      },
      {
        name: 'Class of Member 2',
        field: 'class2',
        component: 'input',
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 2',
        field: 'tel2',
        component: 'input',
      },
      {
        name: 'Email of Member 2',
        field: 'email2',
        component: 'input',
      },
      {
        name: 'Clothing Size of Member 2',
        field: 'clothing2',
        component: 'select',
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 3',
        field: 'name3',
        component: 'input',
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 3',
        field: 'schoolNo3',
        component: 'input',
      },
      {
        name: 'School of Member 3',
        field: 'school3',
        component: 'input',
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 3',
        field: 'college3',
        component: 'input',
      },
      {
        name: 'Major of Member 3',
        field: 'major3',
        component: 'input',
      },
      {
        name: 'Class of Member 3',
        field: 'class3',
        component: 'input',
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 3',
        field: 'tel3',
        component: 'input',
      },
      {
        name: 'Email of Member 3',
        field: 'email3',
        component: 'input',
      },
      {
        name: 'Clothing Size of Member 3',
        field: 'clothing3',
        component: 'select',
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
    ];
    const {
      loading,
      data: { page, count, rows },
      location: { query },
      session,
      proMode,
    } = this.props;
    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    return (
      <PageAnimation>
        <PageTitle title={this.categoryName}>
          <Row gutter={16} className="list-view">
            <Col xs={24}>
              <Tabs
                defaultActiveKey={query.category}
                activeKey={query.category}
                animated={false}
                onChange={this.handleCategoryChange}
              >
                <Tabs.TabPane tab="Contests" key="0" />
                <Tabs.TabPane tab="Tests" key="2" />
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
                  {proMode && (
                    <Table.Column
                      title="ID"
                      key="ID"
                      render={(text, record: IContest) => <span>{record.contestId}</span>}
                    />
                  )}
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
                                  {moment(record.startAt).format('YYYY-MM-DD HH:mm:ss Z')}{' '}
                                  ({moment(record.startAt).from(serverTime)})
                                </td>
                              </tr>
                              <tr>
                                <td className={classNames(gStyles.textRight, gStyles.textBold)}>
                                  End:
                                </td>
                                <td>
                                  {moment(record.endAt).format('YYYY-MM-DD HH:mm:ss Z')} (
                                  {moment(record.endAt).from(serverTime)})
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        }
                      >
                        <span>
                          {moment(record.startAt).format('YYYY-MM-DD HH:mm')} ~{' '}
                          {moment(record.endAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </Popover>
                    )}
                  />
                  <Table.Column
                    title="Status"
                    key="status"
                    className="no-wrap"
                    render={(text, record: any) => (
                      <TimeStatusBadge
                        start={new Date(record.startAt).getTime()}
                        end={new Date(record.endAt).getTime()}
                        cur={serverTime}
                      />
                    )}
                  />

                  <Table.Column
                    title=""
                    key="actions"
                    className="no-wrap"
                    render={(text, record: any) => {
                      if (record.type !== ContestTypes.Register) {
                        return null;
                      }
                      return (
                        <>
                          {this.canRegister(record.registerStartAt, record.registerEndAt) ? (
                            <GeneralFormModal
                              loadingEffect="contests/addContestUser"
                              title="Register Contest"
                              autoMsg
                              items={record.team ? addTeamUserFormItems : addUserFormItems}
                              submit={(dispatch: ReduxProps['dispatch'], values) => {
                                let data = {};
                                data['nickname'] = values['nickname'];
                                data['password'] = values['password'];
                                data['unofficial'] =
                                  values['unofficial'] === 'false' ? false : true;
                                let members = [];
                                if (record.team) {
                                  members = [{}, {}, {}];
                                  for (let i = 0; i < 3; i++) {
                                    for (let j = 0; j < this.formList.length; j++) {
                                      members[i][this.formList[j]] =
                                        values[this.formList[j] + (i + 1)];
                                    }
                                  }
                                } else {
                                  members = [{}];
                                  for (let j = 0; j < this.formList.length; j++) {
                                    members[0][this.formList[j]] = values[this.formList[j] + 1];
                                  }
                                }
                                data['members'] = members;

                                return dispatch({
                                  type: 'contests/addContestUser',
                                  payload: {
                                    id: record.contestId,
                                    data: data,
                                  },
                                });
                              }}
                              onSuccess={(
                                dispatch: ReduxProps['dispatch'],
                                ret: IApiResponse<any>,
                              ) => {
                                msg.success('Register contest successfully');
                                tracker.event({
                                  category: 'contests',
                                  action: 'registerContest',
                                });
                              }}
                            >
                              <a title="Register Contest">
                                <Icon type="plus" />
                              </a>
                            </GeneralFormModal>
                          ) : (
                            <span className="visibility-hidden">
                              <Icon type="plus" />
                            </span>
                          )}
                          <span title="Contest Users" className="ml-sm-md">
                            <Link
                              to={urlf(pages.contests.users, { param: { id: record.contestId } })}
                              onClick={() => {
                                tracker.event({
                                  category: 'contests',
                                  action: 'toContestUsers',
                                });
                              }}
                            >
                              <Icon type="unordered-list" />
                            </Link>
                          </span>
                        </>
                      );
                    }}
                  />
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
                  label="Go to Contest"
                  placeholder="Contest ID"
                  toDetailLink={(id) => urlf(pages.contests.home, { param: { id } })}
                />
              </Card>
              <Card bordered={false}>
                <FilterCard
                  fields={[
                    { displayName: 'Title', fieldName: 'title' },
                    {
                      displayName: 'Type',
                      fieldName: 'type',
                      options: contestTypes.map((res) => {
                        return { fieldName: res.id, displayName: res.name };
                      }),
                    },
                  ]}
                  initQuery={{ category: query.category }}
                />
              </Card>
              {session.loggedIn && (
                <Card bordered={false}>
                  <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
                    <Form.Item
                      className="single-form-item"
                      label={
                        <div>
                          <span className="title">My Joined Contests</span>
                          <div className="float-right">
                            <Switch
                              defaultChecked={!!query.joined}
                              onChange={this.handleJoinedChange}
                              loading={loading}
                            />
                          </div>
                        </div>
                      }
                    />
                  </Form>
                </Card>
              )}
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
    proMode: !!state.settings.proMode,
  };
}

export default connect(mapStateToProps)(ContestList);
