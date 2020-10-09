/**
 * title: Contest Users
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Icon, Button } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import FilterCard from '@/components/FilterCard';
import { isAdminDog } from '@/utils/permission';
import GeneralFormModal from '@/components/GeneralFormModal';
import msg from '@/utils/msg';
import { matchPath, withRouter } from 'react-router';
import { get as safeGet } from 'lodash';
import tracker from '@/utils/tracker';
import contestUserStatus, { ContestUserStatus } from '@/configs/contestUserStatus';
import ImportContestUserModal from './ImportContestUserModal';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  data: IList<IContestUser>;
  contestUser: IContestUser;
  contestDetail: IContest;
  loading: boolean;
  isAdmin: boolean;

  session: ISessionStatus;
}

interface State {}

class ContestUserList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    isAdmin: false,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleTableChange = (e) => {};

  editContestUser = (uid) => {
    const { dispatch, id, isAdmin } = this.props;
    const matchDetail = matchPath(this.props.location.pathname, {
      path: isAdmin ? pages.admin.contestUsers : pages.contests.users,
      exact: true,
    });
    if (matchDetail) {
      dispatch({
        type: 'contests/getContestUser',
        payload: {
          id,
          uid,
        },
      });
    }
  };

  addUserFormItems = (contestUser: any = {}, uid?: number) => {
    const { isAdmin } = this.props;
    let items: any[] = [
      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        initialValue: contestUser[uid]?.nickname || '',
        rules: [{ required: true, message: 'Please input nickname' }],
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        initialValue: contestUser[uid]?.password || '',
        rules: [{ required: true, message: 'Please input password' }],
      },
      {
        name: 'Unofficial Participation',
        field: 'unofficial',
        component: 'select',
        initialValue: String(contestUser[uid]?.unofficial || false),
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Name',
        field: 'name1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].name', ''),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No.',
        field: 'schoolNo1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].schoolNo', ''),
      },
      {
        name: 'School',
        field: 'school1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].school', ''),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College',
        field: 'college1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].college', ''),
      },
      {
        name: 'Major',
        field: 'major1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].major', ''),
      },
      {
        name: 'Class',
        field: 'class1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].class', ''),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel',
        field: 'tel1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].tel', ''),
      },
      {
        name: 'Email',
        field: 'email1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].email', ''),
        rules: [{ required: true, message: 'Please input email' }],
      },
      {
        name: 'Clothing',
        field: 'clothing1',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[0].clothing', ''),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
    ];
    if (!contestUser[uid]) {
      // 添加用户
      items.unshift({
        name: 'Username',
        field: 'username',
        component: 'input',
        initialValue: '',
        rules: [{ required: true, message: 'Please input username' }],
      });
    }
    if (isAdmin) {
      items.push({
        name: 'Status',
        field: 'status',
        component: 'select',
        options: contestUserStatus.map((item) => ({
          name: item.name,
          value: item.id,
        })),
        initialValue: `${contestUser[uid]?.status ?? ContestUserStatus.accepted}`,
        rules: [{ required: true, message: 'Please ' }],
      });
    }
    return items;
  };
  addTeamUserFormItems = (contestUser: any = {}, uid?: number) => {
    const { isAdmin } = this.props;
    const items: any[] = [
      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        initialValue: contestUser[uid]?.nickname || '',
        rules: [{ required: true, message: 'Please input nickname' }],
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        initialValue: contestUser[uid]?.password || '',
        rules: [{ required: true, message: 'Please input password' }],
      },
      {
        name: 'Unofficial Participation',
        field: 'unofficial',
        component: 'select',
        initialValue: String(contestUser[uid]?.unofficial || false),
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Name of Member 1',
        field: 'name1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].name', ''),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 1',
        field: 'schoolNo1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].schoolNo', ''),
      },
      {
        name: 'School of Member 1',
        field: 'school1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].school', ''),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 1',
        field: 'college1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].college', ''),
      },
      {
        name: 'Major of Member 1',
        field: 'major1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].major', ''),
      },
      {
        name: 'Class of Member 1',
        field: 'class1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].class', ''),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 1',
        field: 'tel1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].tel', ''),
      },
      {
        name: 'Email of Member 1',
        field: 'email1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].email', ''),
        rules: [{ required: true, message: 'Please input email' }],
      },
      {
        name: 'Clothing of Member 1',
        field: 'clothing1',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[0].clothing', ''),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 2',
        field: 'name2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].name', ''),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 2',
        field: 'schoolNo2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].schoolNo', ''),
      },
      {
        name: 'School of Member 2',
        field: 'school2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].school', ''),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 2',
        field: 'college2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].college', ''),
      },
      {
        name: 'Major of Member 2',
        field: 'major2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].major', ''),
      },
      {
        name: 'Class of Member 2',
        field: 'class2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].class', ''),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 2',
        field: 'tel2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].tel', ''),
      },
      {
        name: 'Email of Member 2',
        field: 'email2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].email', ''),
      },
      {
        name: 'Clothing of Member 2',
        field: 'clothing2',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[1].clothing', ''),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 3',
        field: 'name3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].name', ''),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 3',
        field: 'schoolNo3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].schoolNo', ''),
      },
      {
        name: 'School of Member 3',
        field: 'school3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].school', ''),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 3',
        field: 'college3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].college', ''),
      },
      {
        name: 'Major of Member 3',
        field: 'major3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].major', ''),
      },
      {
        name: 'Class of Member 3',
        field: 'class3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].class', ''),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 3',
        field: 'tel3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].tel', ''),
      },
      {
        name: 'Email of Member 3',
        field: 'email3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].email', ''),
      },
      {
        name: 'Clothing of Member 3',
        field: 'clothing3',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[2].clothing', ''),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
    ];

    if (!contestUser[uid]) {
      // 添加用户
      items.unshift({
        name: 'Username',
        field: 'username',
        component: 'input',
        initialValue: '',
        rules: [{ required: true, message: 'Please input username' }],
      });
    }
    if (isAdmin) {
      items.push({
        name: 'Status',
        field: 'status',
        component: 'select',
        options: contestUserStatus.map((item) => ({
          name: item.name,
          value: item.id,
        })),
        initialValue: `${contestUser[uid]?.status ?? ContestUserStatus.accepted}`,
        rules: [{ required: true, message: 'Please select status' }],
      });
    }
    return items;
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

  auditFormItems = [
    {
      name: 'Result',
      field: 'status',
      component: 'select',
      options: contestUserStatus
        .filter((item) => item.id !== ContestUserStatus.waiting)
        .map((item) => ({
          name: item.name,
          value: item.id,
        })),
      initialValue: `${ContestUserStatus.accepted}`,
      rules: [{ required: true, message: 'Please select status' }],
    },
    {
      name: 'Reason',
      field: 'reason',
      component: 'input',
      initialValue: '',
      placeholder: 'Reason to notice user (no need to fiil if selected "Accepted")',
      rules: [],
    },
  ];

  render() {
    const {
      loading,
      data: { page, count, rows },
      id,
      contestUser,
      contestDetail,
      session,
      location: { query },
      isAdmin,
    } = this.props;

    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    const regInProgress =
      new Date(contestDetail.registerStartAt).getTime() <= serverTime &&
      serverTime < new Date(contestDetail.registerEndAt).getTime();
    const isTeam = contestDetail.team;

    let this_ = this;
    return (
      <Row gutter={16}>
        <Col xs={24} md={18} xxl={20}>
          <Card bordered={false} className="list-card">
            <Table
              dataSource={rows}
              rowKey="contestUserId"
              loading={loading}
              onChange={this.handleTableChange}
              pagination={false}
              className="responsive-table"
            >
              <Table.Column
                title=""
                key="unofficial"
                render={(text, user: IContestUser) => {
                  if (user.unofficial) {
                    return '*';
                  } else {
                    return '';
                  }
                }}
              />
              <Table.Column
                title="ID"
                key="contestUserId"
                dataIndex="contestUserId"
                className="nowrap"
              />
              <Table.Column
                title="Username"
                key="username"
                dataIndex="username"
                className="nowrap"
              />
              <Table.Column
                title="Nickname"
                key="nickname"
                dataIndex="nickname"
                className="nowrap"
              />
              <Table.Column
                title="Info"
                key="info"
                render={(text, user: IContestUser) => {
                  return user.members.map((item, index) => {
                    let str = [item.name, item.school, item.class]
                      .filter((item) => item)
                      .join(' | ');
                    return (
                      <span key={`${index}_${str}`}>
                        {str}
                        <br />
                      </span>
                    );
                  });
                }}
              />
              <Table.Column
                title="Status"
                key="status"
                className="nowrap"
                render={(text, user: IContestUser) => {
                  if (user.status === ContestUserStatus.waiting) {
                    return (
                      <span>
                        <Icon type="question" /> Pending
                      </span>
                    );
                  }
                  if (user.status === ContestUserStatus.accepted) {
                    return (
                      <span>
                        <Icon type="check" /> Accepted
                      </span>
                    );
                  }
                  if (user.status === ContestUserStatus.return) {
                    return (
                      <span>
                        <Icon type="exclamation" /> Modification Required
                      </span>
                    );
                  }
                  if (user.status === ContestUserStatus.rejected) {
                    return (
                      <span>
                        <Icon type="close" /> Rejected
                      </span>
                    );
                  }
                }}
              />
              <Table.Column
                title=""
                key="actions"
                className="nowrap"
                render={(text, user: IContestUser) => {
                  const actions: React.ReactNode[] = [];
                  if (
                    (regInProgress &&
                      this.props.session.loggedIn &&
                      user.username === session.user.username) ||
                    isAdminDog(session)
                  ) {
                    actions.push(
                      <span key="edit" className="nowrap">
                        <GeneralFormModal
                          loadingEffect="contests/updateContestUser"
                          title="Edit Register Info"
                          autoMsg
                          items={
                            contestUser[text.contestUserId]
                              ? isTeam
                                ? this_.addTeamUserFormItems(contestUser, text.contestUserId)
                                : this_.addUserFormItems(contestUser, text.contestUserId)
                              : []
                          }
                          submit={(dispatch: ReduxProps['dispatch'], values) => {
                            let data = {};
                            data['nickname'] = values['nickname'];
                            data['password'] = values['password'];
                            data['unofficial'] = values['unofficial'] === 'false' ? false : true;
                            let members = [];
                            if (isTeam) {
                              members = [{}, {}, {}];
                              for (let i = 0; i < 3; i++) {
                                for (let j = 0; j < this.formList.length; j++) {
                                  members[i][this.formList[j]] = values[this.formList[j] + (i + 1)];
                                }
                              }
                            } else {
                              members = [{}];
                              for (let j = 0; j < this.formList.length; j++) {
                                members[0][this.formList[j]] = values[this.formList[j] + 1];
                              }
                            }
                            data['members'] = members;
                            isAdmin && (data['status'] = +values['status']);

                            return dispatch({
                              type: 'contests/updateContestUser',
                              payload: {
                                id,
                                uid: user.contestUserId,
                                data: data,
                              },
                            });
                          }}
                          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                            msg.success('Edit register info successfully');
                            tracker.event({
                              category: 'contests',
                              action: 'modifyRegisterInfo',
                            });
                          }}
                          onSuccessModalClosed={(
                            dispatch: ReduxProps['dispatch'],
                            ret: IApiResponse<any>,
                          ) => {
                            dispatch({
                              type: 'contests/getUserList',
                              payload: {
                                cid: id,
                                query,
                              },
                            });
                          }}
                        >
                          <a onClick={() => this.editContestUser(text.contestUserId)}>
                            <Icon type="edit" />
                          </a>
                        </GeneralFormModal>
                      </span>,
                    );
                  }
                  if (isAdminDog(session)) {
                    actions.push(
                      <span key="audit">
                        <GeneralFormModal
                          loadingEffect="admin/auditContestUser"
                          title="Audit Registration"
                          autoMsg
                          items={this.auditFormItems}
                          submit={(dispatch: ReduxProps['dispatch'], values) => {
                            const data = {
                              contestId: id,
                              contestUserId: user.contestUserId,
                              status: +values.status,
                              reason: values.reason,
                            };
                            return dispatch({
                              type: 'admin/auditContestUser',
                              payload: data,
                            });
                          }}
                          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                            msg.success('Audit successfully');
                            tracker.event({
                              category: 'admin',
                              action: 'auditContestUser',
                            });
                          }}
                          onSuccessModalClosed={(
                            dispatch: ReduxProps['dispatch'],
                            ret: IApiResponse<any>,
                          ) => {
                            dispatch({
                              type: 'contests/getUserList',
                              payload: {
                                cid: id,
                                query,
                              },
                            });
                          }}
                        >
                          <a className="ml-md-lg">
                            <Icon type="schedule" />
                          </a>
                        </GeneralFormModal>
                      </span>,
                    );
                  }
                  return actions;
                }}
              />
            </Table>
            <Pagination
              className="ant-table-pagination"
              total={count}
              current={page}
              pageSize={limits.posts.list}
              onChange={this.handlePageChange}
            />
          </Card>
        </Col>

        <Col xs={24} md={6} xxl={4}>
          {isAdmin && (
            <Card bordered={false}>
              <GeneralFormModal
                loadingEffect="contests/addContestUser"
                title="Add Contest User"
                autoMsg
                items={contestDetail?.team ? this.addTeamUserFormItems() : this.addUserFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  let data: any = {};
                  data['nickname'] = values['nickname'];
                  data['password'] = values['password'];
                  data['unofficial'] = values['unofficial'] === 'false' ? false : true;
                  let members = [];
                  if (contestDetail?.team) {
                    members = [{}, {}, {}];
                    for (let i = 0; i < 3; i++) {
                      for (let j = 0; j < this.formList.length; j++) {
                        members[i][this.formList[j]] = values[this.formList[j] + (i + 1)];
                      }
                    }
                  } else {
                    members = [{}];
                    for (let j = 0; j < this.formList.length; j++) {
                      members[0][this.formList[j]] = values[this.formList[j] + 1];
                    }
                  }
                  data['members'] = members;
                  isAdmin && (data['status'] = +values['status']);
                  if (values.username) {
                    data.username = values.username;
                  }

                  return dispatch({
                    type: 'contests/addContestUser',
                    payload: {
                      id,
                      data: data,
                    },
                  });
                }}
                onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                  msg.success('Add contest user successfully');
                  tracker.event({
                    category: 'admin',
                    action: 'addContestUser',
                  });
                }}
                onSuccessModalClosed={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<any>,
                ) => {
                  dispatch({
                    type: 'contests/getUserList',
                    payload: {
                      cid: id,
                      query,
                    },
                  });
                }}
              >
                <Button block>Add User</Button>
              </GeneralFormModal>
              <ImportContestUserModal contestId={id}>
                <Button block className="mt-md">
                  Import Users
                </Button>
              </ImportContestUserModal>
            </Card>
          )}
          <Card bordered={false}>
            <FilterCard
              fields={[
                { displayName: 'ID', fieldName: 'contestUserId' },
                { displayName: 'Username', fieldName: 'username' },
                { displayName: 'Nickname', fieldName: 'nickname' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
  };
}

export default connect(mapStateToProps)(withRouter(ContestUserList));
