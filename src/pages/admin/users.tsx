/**
 * title: Admin Users
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import router from 'umi/router';
import tracker from '@/utils/tracker';
import { Row, Col, Card, Table, Pagination, Button } from 'antd';
import limits from '@/configs/limits';
import FilterCard from '@/components/FilterCard';
import constants from '@/configs/constants';
import GeneralFormDrawer from '@/components/GeneralFormDrawer';
import msg from '@/utils/msg';
import { Link } from 'react-router-dom';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import TimeBar from '@/components/TimeBar';
import { IGeneralFormItem } from '@/components/GeneralForm';
import userForbidden, { UserForbidden } from '@/configs/userForbidden';
import GeneralFormModal from '@/components/GeneralFormModal';
import userPermission, { UserPermission } from '@/configs/userPermission';
import ImportUserModal from '@/components/ImportUserModal';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IList<IUser>;
  detailMap: ITypeObject<IUser>;
  listLoading: boolean;
  detailLoading: boolean;
  submitLoading: boolean;
}

interface State {
  currentUserId?: number;
}

class AdminUserList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentUserId: undefined,
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  editUser = (userId) => {
    this.setState(
      {
        currentUserId: userId,
      },
      () => {
        setTimeout(
          () =>
            this.props.dispatch({
              type: 'admin/getUserDetail',
              payload: {
                id: userId,
              },
            }),
          constants.drawerAnimationDuration,
        );
      },
    );
  };

  getUserDetailFormItems(userId?: number) {
    const { detailMap } = this.props;
    const detail = detailMap[userId];
    const items: IGeneralFormItem[] = [
      {
        name: 'Username',
        field: 'username',
        component: 'input',
        initialValue: detail?.username || '',
        disabled: !!detail?.username,
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        initialValue: detail?.nickname || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'School',
        field: 'school',
        component: 'input',
        initialValue: detail?.school || '',
        rules: [],
      },
      {
        name: 'College',
        field: 'college',
        component: 'input',
        initialValue: detail?.college || '',
        rules: [],
      },
      {
        name: 'Major',
        field: 'major',
        component: 'input',
        initialValue: detail?.major || '',
        rules: [],
      },
      {
        name: 'Class',
        field: 'class',
        component: 'input',
        initialValue: detail?.class || '',
        rules: [],
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        initialValue: '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Forbidden',
        field: 'forbidden',
        component: 'select',
        initialValue: `${detail?.forbidden ?? UserForbidden.normal}`,
        options: userForbidden.map((item) => ({
          value: item.id,
          name: item.name,
        })),
        rules: [{ required: true }],
      },
      {
        name: 'Permission',
        field: 'permission',
        component: 'select',
        initialValue: `${detail?.permission ?? UserPermission.normal}`,
        options: userPermission.map((item) => ({
          value: item.id,
          name: item.name,
        })),
        rules: [{ required: true }],
      },
    ];
    if (detail) {
      items.splice(6, 1);
    } else {
      items.splice(7);
    }
    return items;
  }

  getHandledDataFromForm(values) {
    return {
      ...values,
      forbidden: +values.forbidden,
      permission: +values.permission,
    };
  }

  resetPasswordFormItems = [
    {
      name: 'New Password',
      field: 'password',
      component: 'input',
      type: 'password',
      rules: [{ required: true, message: 'Please input new password' }],
    },
    {
      name: 'Confirm Password',
      field: 'confirmPassword',
      component: 'input',
      type: 'password',
      rules: [{ required: true, message: 'Please confirm new password' }],
    },
  ];

  render() {
    const {
      listLoading,
      detailLoading,
      submitLoading,
      list: { page, count, rows },
      detailMap,
    } = this.props;
    const { currentUserId } = this.state;
    const detail = detailMap[currentUserId];
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="userId"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: IUser) => (
                    <span
                      className={record.forbidden === UserForbidden.normal ? '' : 'text-secondary'}
                    >
                      {record.userId}
                    </span>
                  )}
                />
                <Table.Column
                  title="Username"
                  key="Username"
                  render={(text, record: IUser) => (
                    <span
                      className={record.forbidden === UserForbidden.normal ? '' : 'text-secondary'}
                    >
                      {record.username}
                    </span>
                  )}
                />
                <Table.Column
                  title="Nickname"
                  key="Nickname"
                  render={(text, record: IUser) => (
                    <span
                      className={record.forbidden === UserForbidden.normal ? '' : 'text-secondary'}
                    >
                      {record.nickname}
                    </span>
                  )}
                />
                <Table.Column
                  title="Last Login"
                  key="LastLogin"
                  render={(text, record: IUser) =>
                    record.lastTime && (
                      <span>
                        <TimeBar time={new Date(record.lastTime).getTime()} />
                        <span className="ml-md">({record.lastIp})</span>
                      </span>
                    )
                  }
                />
                <Table.Column
                  title="Register at"
                  key="CreatedAt"
                  render={(text, record: IUser) => (
                    <TimeBar time={new Date(record.createdAt).getTime()} />
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: IUser) => (
                    <div>
                      <GeneralFormDrawer
                        fetchLoading={record.userId === currentUserId && (!detail || detailLoading)}
                        loading={record.userId === currentUserId && submitLoading}
                        // fetchLoadingEffect="admin/getUserDetail"
                        // loadingEffect="admin/updateUserDetail"
                        title={`Edit User #${record.userId}`}
                        autoMsg
                        cancelText="Cancel (discard changes)"
                        width={600}
                        maskClosable={false}
                        items={this.getUserDetailFormItems(record.userId)}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          tracker.event({
                            category: 'admin',
                            action: 'updateUser',
                          });
                          const data = this.getHandledDataFromForm(values);
                          delete data.username;
                          delete data.password;
                          console.log('data', data);
                          return dispatch({
                            type: 'admin/updateUserDetail',
                            payload: {
                              id: record.userId,
                              data,
                            },
                          });
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                          msg.success('Update user successfully');
                        }}
                        onSuccessAndClosed={(
                          dispatch: ReduxProps['dispatch'],
                          ret: IApiResponse,
                        ) => {
                          dispatch({
                            type: 'admin/getUserList',
                            payload: this.props.location.query,
                          });
                        }}
                      >
                        <a onClick={() => this.editUser(record.userId)}>Edit</a>
                      </GeneralFormDrawer>
                      <GeneralFormModal
                        loadingEffect="admin/resetUserPasswordByAdmin"
                        title={`Reset Password for ${record.nickname}`}
                        autoMsg
                        items={this.resetPasswordFormItems}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          if (values.password !== values.confirmPassword) {
                            msg.error('Two passwords are inconsistent');
                            return;
                          } else {
                            tracker.event({
                              category: 'admin',
                              action: 'resetUserPasswordByAdmin',
                            });
                            return dispatch({
                              type: 'admin/resetUserPasswordByAdmin',
                              payload: {
                                id: record.userId,
                                password: values.password,
                              },
                            });
                          }
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                          msg.success('Reset password successfully');
                        }}
                      >
                        <a className="ml-md-lg">Reset Password</a>
                      </GeneralFormModal>
                      {record.forbidden === UserForbidden.normal && (
                        <Link
                          to={urlf(pages.users.detail, { param: { id: record.userId } })}
                          target="_blank"
                          className="ml-md-lg"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.admin.userList}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormDrawer
                loadingEffect="admin/createUser"
                title="Add User"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getUserDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createUser',
                  });
                  const data = this.getHandledDataFromForm(values);
                  delete data.forbidden;
                  delete data.permission;
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createUser',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ userId: number }>,
                ) => {
                  msg.success(`Create user #${ret.data.userId} successfully`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getUserList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block>Add User</Button>
              </GeneralFormDrawer>
              <ImportUserModal>
                <Button block className="mt-md">Import Users</Button>
              </ImportUserModal>
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'User ID', fieldName: 'userId' },
                  { displayName: 'Username', fieldName: 'username' },
                  { displayName: 'Nickname', fieldName: 'nickname' },
                  { displayName: 'Grade', fieldName: 'grade' },
                  {
                    displayName: 'Forbidden',
                    fieldName: 'forbidden',
                    options: userForbidden.map((item) => ({
                      displayName: item.name,
                      fieldName: item.id,
                    })),
                  },
                  {
                    displayName: 'Permission',
                    fieldName: 'permission',
                    options: userPermission.map((item) => ({
                      displayName: item.name,
                      fieldName: item.id,
                    })),
                  },
                  {
                    displayName: 'Verified',
                    fieldName: 'verified',
                    options: [
                      {
                        displayName: 'Yes',
                        fieldName: true,
                      },
                      {
                        displayName: 'No',
                        fieldName: false,
                      },
                    ],
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
    listLoading: !!state.loading.effects['admin/getUserList'],
    detailLoading: !!state.loading.effects['admin/getUserDetail'],
    submitLoading: !!state.loading.effects['admin/updateUserDetail'],
    list: state.admin.userList,
    detailMap: state.admin.userDetail,
  };
}

export default connect(mapStateToProps)(AdminUserList);
