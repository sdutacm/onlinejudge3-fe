/**
 * title: Admin User Permissions
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import tracker from '@/utils/tracker';
import { Row, Col, Card, Table, Button, List } from 'antd';
import msg from '@/utils/msg';
import permConfig, { EPerm } from '@/common/configs/perm.config';
import { memoize } from '@/utils/decorators';
import UserBar from '@/components/UserBar';
import classNames from 'classnames';
import AddUserModal from '@/components/AddUserModal';
import constants from '@/configs/constants';

const USER_ITEM_CLASSNAME = '_user-permissions-user-item-ref';

export interface IUserPermissionsObject {
  userId: number;
  username: string;
  nickname: string;
  avatar: string;
  permissions: EPerm[];
}

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IFullList<IUserPermissionsObject>;
  listLoading: boolean;
  submitLoading: boolean;
}

interface State {
  userIndex: number;
  selectedPermissions: EPerm[];
}

class AdminUserPermissionManagement extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  private userListRef: any;

  constructor(props) {
    super(props);
    this.state = {
      userIndex: 0,
      selectedPermissions: [],
    };
  }

  componentWillReceiveProps(np: Props) {
    if (this.props.listLoading && !np.listLoading) {
      this.syncSelected(np.list.rows);
    }
  }

  @memoize
  currentUserImpl(rows: IUserPermissionsObject[], index: number) {
    return rows[index] ?? null;
  }

  get currentUser() {
    return this.currentUserImpl(this.props.list.rows, this.state.userIndex);
  }

  get currentUserId() {
    return this.currentUser?.userId ?? null;
  }

  get currentUserPermissions() {
    return this.currentUser?.permissions ?? null;
  }

  get hasChanges() {
    const original = [...(this.currentUserPermissions || [])].sort().join(';');
    const current = [...this.state.selectedPermissions].sort().join(';');
    if (original.length !== current.length) {
      return true;
    }
    return original !== current;
  }

  syncSelected = (rows: IUserPermissionsObject[], index?: number) => {
    let usingUserIndex = index ?? this.state.userIndex;
    if (!rows[usingUserIndex]) {
      usingUserIndex = 0;
    }
    this.setState({
      userIndex: usingUserIndex,
      selectedPermissions: rows[usingUserIndex]?.permissions || [],
    });
  };

  handleSelectUser = (index: number) => {
    // 检查是否修改过
    if (this.hasChanges && !confirm('The changes are not saved. Are you sure to discard?')) {
      return;
    }
    this.syncSelected(this.props.list.rows, index);
  };

  scrollToUserItemNode = (index: number) => {
    const itemRef = this.userListRef.querySelectorAll(`.${USER_ITEM_CLASSNAME}`)[index];
    itemRef.scrollIntoView?.();
  };

  handleAddUser = (user: IUser) => {
    const { rows } = this.props.list;
    const existedIndex = rows.findIndex((item) => item.userId === user.userId);
    if (existedIndex > -1) {
      // 重复，直接定位并触发 handleSelectUser
      this.scrollToUserItemNode(existedIndex);
      this.syncSelected(rows, existedIndex);
      msg.warn('The user has already been added');
    } else {
      // 添加一个空权限用户并调用 dispatch setAllUserPermissions
      const newRows: IUserPermissionsObject[] = [
        {
          userId: user.userId,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          permissions: [],
        },
        ...rows,
      ];
      this.props.dispatch({
        type: 'admin/setAllUserPermissions',
        payload: {
          data: {
            count: newRows.length,
            rows: newRows,
          },
        },
      });
      setTimeout(() => {
        this.scrollToUserItemNode(0);
        window.scrollTo({ top: 0 });
        this.syncSelected(this.props.list.rows, 0);
        msg.success('Added. Please select permissions');
      }, constants.modalAnimationDurationFade);
    }
  };

  saveUserPermissions = () => {
    const userId = this.currentUserId;
    const permissions = this.state.selectedPermissions;
    this.props
      .dispatch({
        type: 'admin/setUserPermissions',
        payload: {
          userId,
          permissions,
        },
      })
      .then((ret) => {
        msg.auto(ret);
        if (ret.success) {
          msg.success('Saved (it will take effect in 30 seconds)');
          tracker.event({
            category: 'admin',
            action: 'setUserPermissions',
          });
          const newRows = [...this.props.list.rows];
          const index = newRows.findIndex((item) => item.userId === this.currentUserId);
          newRows[index].permissions = permissions;
          this.props.dispatch({
            type: 'admin/setAllUserPermissions',
            payload: {
              data: {
                count: newRows.length,
                rows: newRows,
              },
            },
          });
        }
      });
  };

  render() {
    const {
      listLoading,
      list: { count, rows },
      submitLoading,
    } = this.props;
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={6} style={{ position: 'sticky', top: '84px' }}>
            <Card bordered={false} className="list-card">
              <div style={{ margin: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <h4 className="mb-none">Authorized Users ({count})</h4>
                {this.hasChanges ? (
                  <Button shape="circle" icon="plus" size="small" disabled />
                ) : (
                  <AddUserModal title="Add User" multiple={false} onAdd={this.handleAddUser}>
                    <Button shape="circle" icon="plus" size="small" />
                  </AddUserModal>
                )}
              </div>
              <div
                ref={(ref) => {
                  this.userListRef = ref;
                }}
              >
                <List
                  itemLayout="horizontal"
                  loading={listLoading}
                  dataSource={rows}
                  split={false}
                  style={{ height: 'calc(100vh - 84px - 56px - 68px)', overflow: 'auto' }}
                  renderItem={(item: IUserPermissionsObject, index) => (
                    <List.Item
                      className={classNames('cursor-pointer bg-selection', USER_ITEM_CLASSNAME, {
                        selected: this.state.userIndex === index,
                      })}
                      style={{ padding: '8px 16px' }}
                      onClick={() => this.handleSelectUser(index)}
                    >
                      <UserBar user={item} showAsText />
                      <span className="text-secondary ml-sm-md">({item.permissions.length})</span>
                    </List.Item>
                  )}
                />
              </div>
              <div style={{ padding: '20px 16px 16px' }}>
                <Button
                  block
                  type="primary"
                  loading={submitLoading}
                  disabled={!this.hasChanges}
                  onClick={this.saveUserPermissions}
                >
                  Save
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={18}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={permConfig}
                rowKey="permission"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
                rowSelection={{
                  selectedRowKeys: this.state.selectedPermissions,
                  onChange: (selectedRowKeys: EPerm[]) => {
                    this.setState({ selectedPermissions: selectedRowKeys });
                  },
                }}
              >
                <Table.Column
                  title="Select Permissions"
                  key="Permission"
                  render={(text, record: typeof permConfig[0]) => (
                    <div className="mt-sm mb-sm">
                      <p className="mb-sm-md">
                        <span style={{ fontWeight: 500, fontSize: '16px' }}>{record.name}</span>
                        <span className="text-secondary ml-md">{record.permission}</span>
                      </p>
                      <p style={{ fontSize: '13px' }}>{record.description}</p>
                    </div>
                  )}
                />
              </Table>
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
    listLoading: !!state.loading.effects['admin/getAllUserPermissions'],
    list: state.admin.allUserPermissions,
    submitLoading: !!state.loading.effects['admin/setUserPermissions'],
  };
}

export default connect(mapStateToProps)(AdminUserPermissionManagement);
