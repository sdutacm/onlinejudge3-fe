/**
 * title: Competition User Management
 */

import React from 'react';
import { connect } from 'dva';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { getPathParamId } from '@/utils/getPathParams';
import { ICompetitionUser } from '@/common/interfaces/competition';
import { Row, Col, Card, Button, Table, Icon, Popconfirm, Tabs, Tag } from 'antd';
import GeneralFormModal from '@/components/GeneralFormModal';
import { ECompetitionUserStatus, ECompetitionUserRole } from '@/common/enums';
import Link from 'umi/link';
import { urlf } from '@/utils/format';
import { formatCompetitionUserSeatId } from '@/utils/competition';
import tracker from '@/utils/tracker';
import msg from '@/utils/msg';
import { aoa2Excel } from '@/utils/misc';
import moment from 'moment';
import { get as safeGet } from 'lodash';
import ImportCompetitionUserModal from '@/components/ImportCompetitionUserModal';

const contestUserRoleOptions = [
  {
    name: 'Admin',
    value: ECompetitionUserRole.admin,
  },
  {
    name: 'Participant',
    value: ECompetitionUserRole.participant,
  },
  {
    name: 'Principal',
    value: ECompetitionUserRole.principal,
  },
  {
    name: 'Judge',
    value: ECompetitionUserRole.judge,
  },
  {
    name: 'Auditor',
    value: ECompetitionUserRole.auditor,
  },
  {
    name: 'Field Assistantant',
    value: ECompetitionUserRole.fieldAssistantant,
  },
  {
    name: 'Volunteer',
    value: ECompetitionUserRole.volunteer,
  },
  {
    name: 'Observer',
    value: ECompetitionUserRole.observer,
  },
];

const contestUserStatusOptions = [
  {
    name: 'Under Auditing',
    value: ECompetitionUserStatus.auditing,
  },
  {
    name: 'Available',
    value: ECompetitionUserStatus.available,
  },
  {
    name: 'Modification Required',
    value: ECompetitionUserStatus.modificationRequired,
  },
  {
    name: 'Rejected',
    value: ECompetitionUserStatus.rejected,
  },
  {
    name: 'Entered',
    value: ECompetitionUserStatus.entered,
  },
  {
    name: 'Quitted',
    value: ECompetitionUserStatus.quitted,
  },
];

export interface Props extends ReduxProps, RouteProps {
  id: number;
  data: ICompetitionUser[];
}

interface State {
  currentActiveRole: ECompetitionUserRole;
  exportLoading: boolean;
}

class CompetitionUserManagement extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      currentActiveRole: ECompetitionUserRole.admin,
      exportLoading: false,
    };
  }

  getUsersGroupedByRole = () => {
    const { data: users } = this.props;
    const usersGrouped = {};
    contestUserRoleOptions.forEach(({ value }) => {
      usersGrouped[value] = users.filter((user) => user.role === value);
    });
    return usersGrouped;
  };

  switchTab = (role) => {
    this.setState({
      currentActiveRole: role,
    });
    this.fetchAllUsers();
  };

  getUserFormItems = (data?: ICompetitionUser) => {
    const items = [
      {
        name: 'Role',
        field: 'role',
        component: 'select',
        options: contestUserRoleOptions,
        initialValue: `${data?.role ?? ECompetitionUserRole.participant}`,
      },
      {
        name: 'Status',
        field: 'status',
        component: 'select',
        options: contestUserStatusOptions,
        initialValue: `${data?.status ?? ECompetitionUserStatus.available}`,
      },
      {
        name: 'Unofficial Participation',
        field: 'unofficialParticipation',
        component: 'select',
        initialValue: String(data?.unofficialParticipation || false),
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Banned',
        field: 'banned',
        component: 'select',
        initialValue: String(data?.banned || false),
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Field Short Name',
        field: 'fieldShortName',
        component: 'input',
        initialValue: data?.fieldShortName || '',
      },
      {
        name: 'Seat No.',
        field: 'seatNo',
        component: 'input',
        initialValue: `${data?.seatNo ?? ''}`,
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        initialValue: data?.password || '',
      },
    ];
    if (!data) {
      items.unshift(
        {
          name: 'UID',
          field: 'userId',
          component: 'input',
          initialValue: '',
          // @ts-ignore
          rules: [{ required: true, message: 'Please input UID' }],
        },
        {
          name: 'Nickname',
          field: 'nickname',
          component: 'input',
          initialValue: '',
          rules: [
            { required: true, message: 'Please input nickname' },
            { max: 10, message: 'Nickname cannot be longer than 10 characters' },
          ],
        },
      );
    }
    return items;
  };

  fetchAllUsers = () => {
    const { dispatch, id } = this.props;
    return dispatch({
      type: 'competitions/getAllCompetitionUsers',
      payload: {
        id,
      },
    }).then((ret: IApiResponse<any>) => {
      msg.auto(ret);
      if (ret.success) {
        return ret.data.rows;
      }
      return [];
    });
  };

  handleExport = async () => {
    const { id } = this.props;
    if (this.state.exportLoading) {
      return;
    }
    tracker.event({
      category: 'competitions',
      action: 'exportUsers',
    });
    this.setState({
      exportLoading: true,
    });
    try {
      const users = await this.fetchAllUsers();
      console.log('users', users);
      const fields = [
        'userId',
        'role',
        'status',
        'password',
        'fieldShortName',
        'seatNo',
        'banned',
        'unofficialParticipation',
        'info.nickname',
        'info.subname',
        'info.realName',
        'info.organization',
        'info.company',
        'info.studentNo',
        'info.school',
        'info.college',
        'info.major',
        'info.class',
        'info.tel',
        'info.qq',
        'info.weChat',
        'info.clothing',
        'info.slogan',
        'info.group',
      ];
      const aoa: any[][] = [fields];
      users.forEach((user) => {
        const row = [];
        fields.forEach((field) => {
          switch (field) {
            default:
              row.push(safeGet(user, field, ''));
          }
        });
        aoa.push(row);
      });
      console.log('export competition users:', aoa);
      aoa2Excel(aoa, `${moment().format('YYYY-MM-DD HH_mm_ss')} competition_users_${id}.xlsx`);
    } finally {
      this.setState({
        exportLoading: false,
      });
    }
  };

  handleRandomAllUserPasswords = () => {
    return this.props
      .dispatch({
        type: 'competitions/randomAllCompetitionUserPasswords',
        payload: {
          id: this.props.id,
        },
      })
      .then((ret: IApiResponse<any>) => {
        msg.auto(ret);
        if (ret.success) {
          msg.success('Random password success');
        }
      });
  };

  render() {
    const { loading, id } = this.props;
    const { currentActiveRole } = this.state;
    const usersGrouped = this.getUsersGroupedByRole();

    return (
      <PageAnimation>
        <h3 className="mb-md-lg">User Management</h3>
        <div>
          <Tabs
            activeKey={`${currentActiveRole}`}
            onChange={(key) => this.switchTab(+key)}
            tabBarExtraContent={
              <Button
                size="small"
                shape="circle"
                icon="reload"
                onClick={() => this.fetchAllUsers()}
              ></Button>
            }
          >
            {contestUserRoleOptions.map(({ name, value }) => (
              <Tabs.TabPane
                key={`${value}`}
                tab={
                  <span>
                    {name}
                    <Tag className="ml-md">{usersGrouped[value].length}</Tag>
                  </span>
                }
              />
            ))}
          </Tabs>
        </div>
        <Row gutter={16}>
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={usersGrouped[currentActiveRole]}
                rowKey="userId"
                loading={loading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title=""
                  key="unofficial"
                  render={(text, user: ICompetitionUser) => {
                    if (user.unofficialParticipation) {
                      return '*';
                    } else {
                      return '';
                    }
                  }}
                />
                <Table.Column
                  title="UID"
                  key="UID"
                  render={(text, record: ICompetitionUser) => (
                    <Link to={urlf(pages.users.detail, { param: { id: record.userId } })}>
                      {record.userId}
                    </Link>
                  )}
                />
                <Table.Column
                  title="Info"
                  key="Info"
                  render={(text, record: ICompetitionUser) => {
                    const infoStr = JSON.stringify(record.info || {}, null, 2);
                    return <pre>{infoStr}</pre>;
                  }}
                />
                <Table.Column
                  title="Seat ID"
                  key="Seat ID"
                  render={(text, record: ICompetitionUser) => (
                    <span>{formatCompetitionUserSeatId(record)}</span>
                  )}
                />
                <Table.Column
                  title="Status"
                  key="status"
                  className="nowrap"
                  render={(text, user: ICompetitionUser) => {
                    let statusStr = '';
                    switch (user.status) {
                      case ECompetitionUserStatus.auditing:
                        statusStr = 'Under Auditing';
                        break;
                      case ECompetitionUserStatus.available:
                        statusStr = 'Available';
                        break;
                      case ECompetitionUserStatus.modificationRequired:
                        statusStr = 'Modification Required';
                        break;
                      case ECompetitionUserStatus.rejected:
                        statusStr = 'Rejected';
                        break;
                      case ECompetitionUserStatus.entered:
                        statusStr = 'Entered';
                        break;
                      case ECompetitionUserStatus.quitted:
                        statusStr = 'Quitted';
                        break;
                    }
                    return (
                      <span>
                        {statusStr}
                        {user.banned ? (
                          <span className="text-danger">
                            <br />
                            Banned
                          </span>
                        ) : null}
                      </span>
                    );
                  }}
                />
                <Table.Column
                  title=""
                  key="actions"
                  className="nowrap"
                  render={(text, user: ICompetitionUser) => {
                    return (
                      <span key="edit" className="nowrap">
                        <GeneralFormModal
                          loadingEffect="competitions/updateCompetitionUser"
                          title="Edit User"
                          autoMsg
                          items={this.getUserFormItems(user)}
                          submit={(dispatch: ReduxProps['dispatch'], values) => {
                            const data = {
                              role: Number(values.role),
                              status: Number(values.status) || ECompetitionUserStatus.available,
                              unofficialParticipation: values.unofficialParticipation === 'true',
                              banned: values.banned === 'true',
                              password: values.password || null,
                              fieldShortName: values.fieldShortName || null,
                              seatNo: values.seatNo ? Number(values.seatNo) : null,
                            };
                            return dispatch({
                              type: 'competitions/updateCompetitionUser',
                              payload: {
                                id,
                                userId: user.userId,
                                data,
                              },
                            });
                          }}
                          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                            msg.success('Update user successfully');
                            tracker.event({
                              category: 'competitions',
                              action: 'updateUser',
                            });
                          }}
                          onSuccessModalClosed={(
                            dispatch: ReduxProps['dispatch'],
                            ret: IApiResponse<any>,
                          ) => {
                            dispatch({
                              type: 'competitions/getAllCompetitionUsers',
                              payload: {
                                id,
                              },
                            });
                          }}
                        >
                          <a>
                            <Icon type="edit" />
                          </a>
                        </GeneralFormModal>
                      </span>
                    );
                  }}
                />
              </Table>
            </Card>
          </Col>

          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormModal
                loadingEffect="competitions/createCompetitionUser"
                title="Add User"
                autoMsg
                items={this.getUserFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  const data = {
                    role: Number(values.role),
                    status: Number(values.status) || ECompetitionUserStatus.available,
                    unofficialParticipation: values.unofficialParticipation === 'true',
                    banned: values.banned === 'true',
                    password: values.password || null,
                    fieldShortName: values.fieldShortName || null,
                    seatNo: values.seatNo ? Number(values.seatNo) : null,
                    info: {
                      nickname: values.nickname,
                    },
                  };
                  return dispatch({
                    type: 'competitions/createCompetitionUser',
                    payload: {
                      id,
                      userId: Number(values.userId),
                      data,
                    },
                  });
                }}
                onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                  msg.success('Add user successfully');
                  tracker.event({
                    category: 'competitions',
                    action: 'addUser',
                  });
                }}
                onSuccessModalClosed={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<any>,
                ) => {
                  dispatch({
                    type: 'competitions/getAllCompetitionUsers',
                    payload: {
                      id,
                    },
                  });
                }}
              >
                <Button block>Add User</Button>
              </GeneralFormModal>
              <ImportCompetitionUserModal competitionId={id}>
                <Button block className="mt-md">
                  Import Users
                </Button>
              </ImportCompetitionUserModal>
              <Button block className="mt-md" onClick={this.handleExport}>
                Export Users
              </Button>
              <Popconfirm
                title="The action will assign random password to all no-password users"
                placement="left"
                onConfirm={this.handleRandomAllUserPasswords}
              >
                <Button block className="mt-md">
                  Random Password
                </Button>
              </Popconfirm>
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    loading: !!state.loading.effects['competitions/getAllCompetitionUsers'],
    data: state.competitions.users[id]?.rows || [],
  };
}

export default connect(mapStateToProps)(CompetitionUserManagement);
