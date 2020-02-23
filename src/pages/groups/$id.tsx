/**
 * title: Groups
 */

import React from 'react';
import { connect } from 'dva';
import {
  Icon,
  Button,
  Row,
  Col,
  Card,
  Skeleton,
  Avatar,
  Popover,
  Table,
  Modal,
  Popconfirm,
} from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import GeneralFormModal from '@/components/GeneralFormModal';
import tracker from '@/utils/tracker';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import NotFound from '@/pages/404';
import PageTitle from '@/components/PageTitle';
import { urlf, formatAvatarUrl } from '@/utils/format';
import { Link } from 'react-router-dom';
import {
  GroupJoinChannel,
  groupMemberPermissionMap,
  GroupMemberPermission,
  GroupMemberStatus,
  groupJoinChannels,
  groupMemberPermissions,
} from '@/configs/groups';
import { isAdminDog } from '@/utils/permission';
import { memoize } from '@/utils/decorators';
import TimeBar from '@/components/TimeBar';
import UserBar from '@/components/UserBar';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import { isEqual } from 'lodash';

const MAX_PERMISSION = 999;

export interface Props extends ReduxProps, RouteProps {
  id: number;
  detail: IGroup;
  members: IFullList<IGroupMember>;
  session: ISessionStatus;
  loadings: {
    detail: boolean;
    members: boolean;
    updateGroup: boolean;
    deleteGroup: boolean;
    addGroupMember: boolean;
    updateGroupMember: boolean;
    deleteGroupMember: boolean;
    joinGroup: boolean;
    quitGroup: boolean;
  };
}

interface State {}

class GroupDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if (!isEqual(p.session, np.session)) {
      this.refreshGroup();
    }
  }

  @memoize
  membersImpl(membersRows: IGroupMember[]) {
    return [...membersRows].sort((a, b) => {
      if (a.status !== b.status) {
        return b.status - a.status;
      } else if (a.permission !== b.permission) {
        return b.permission - a.permission;
      } else {
        return a.groupMemberId - b.groupMemberId;
      }
    });
  }

  get members() {
    return this.membersImpl(this.props.members.rows);
  }

  get auditingMembers() {
    return this.members.filter((m) => m.status === GroupMemberStatus.Auditing);
  }

  @memoize
  selfInfoImpl(membersRows: IGroupMember[], session: ISessionStatus) {
    return membersRows.find((m) => m.user.userId === session.user?.userId);
  }

  get selfInfo() {
    return this.selfInfoImpl(this.props.members.rows, this.props.session);
  }

  get isInGroup() {
    return !!this.selfInfoImpl(this.props.members.rows, this.props.session);
  }

  @memoize
  hasAdminPermImpl(membersRows: IGroupMember[], session: ISessionStatus) {
    const selfInfo = this.selfInfoImpl(membersRows, session);
    return selfInfo?.permission >= GroupMemberPermission.Admin || isAdminDog(session);
  }

  get hasAdminPerm() {
    return this.hasAdminPermImpl(this.props.members.rows, this.props.session);
  }

  @memoize
  isGroupMasterImpl(membersRows: IGroupMember[], session: ISessionStatus) {
    const selfInfo = this.selfInfoImpl(membersRows, session);
    return selfInfo?.permission >= GroupMemberPermission.Master;
  }

  get isGroupMaster() {
    return this.isGroupMasterImpl(this.props.members.rows, this.props.session);
  }

  @memoize
  loadingImpl(detailLoading: boolean, membersLoading: boolean) {
    return detailLoading || membersLoading;
  }

  get loading() {
    return this.loadingImpl(this.props.loadings.detail, this.props.loadings.members);
  }

  canOpMember = (member: IGroupMember) => {
    return isAdminDog(this.props.session) || member.permission < this.selfInfo.permission;
  };

  get groupDetailFormItems() {
    const { detail, session } = this.props;
    const items = [
      {
        name: 'Name',
        field: 'name',
        component: 'input',
        initialValue: detail.name,
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'Intro',
        field: 'intro',
        component: 'input',
        initialValue: detail.intro,
      },
      {
        name: 'Private',
        field: 'private',
        component: 'select',
        initialValue: `${!!detail.private || false}`,
        options: [
          {
            value: true,
            name: 'Yes',
          },
          {
            value: false,
            name: 'No',
          },
        ],
        rules: [{ required: true }],
      },
      {
        name: 'Join Channel',
        field: 'joinChannel',
        component: 'select',
        initialValue: `${detail.joinChannel || GroupJoinChannel.Any}`,
        options: groupJoinChannels.map((jc) => ({
          value: jc.id,
          name: jc.name,
        })),
        rules: [{ required: true }],
      },
    ];
    if (isAdminDog(session)) {
      items.splice(2, 0, {
        name: 'Verified',
        field: 'verified',
        component: 'select',
        initialValue: `${!!detail.verified || false}`,
        options: [
          {
            value: true,
            name: 'Yes',
          },
          {
            value: false,
            name: 'No',
          },
        ],
        rules: [{ required: true }],
      });
    }
    return items;
  }

  genGroupMemberFormItems = (member: IGroupMember) => {
    const { session } = this.props;
    const selfPermission = isAdminDog(session) ? MAX_PERMISSION : this.selfInfo.permission;
    const items = [
      {
        name: 'Permission',
        field: 'permission',
        component: 'select',
        initialValue: `${member.permission || GroupMemberPermission.Member}`,
        options: groupMemberPermissions
          .filter((p) => p.id < selfPermission)
          .map((p) => ({
            value: p.id,
            name: p.name,
          })),
        rules: [{ required: true }],
      },
    ];
    return items;
  };

  refreshGroupDetail = () => {
    return this.props.dispatch({
      type: 'groups/getDetail',
      payload: {
        id: this.props.id,
        force: true,
      },
    });
  };

  refreshGroupMembers = () => {
    return this.props.dispatch({
      type: 'groups/getMembers',
      payload: {
        id: this.props.id,
        force: true,
      },
    });
  };

  refreshGroup = () => {
    return Promise.all([this.refreshGroupDetail(), this.refreshGroupMembers()]);
  };

  clearAllGroupState = () => {
    this.props.dispatch({
      type: 'groups/clearDetail',
      payload: {
        id: this.props.id,
      },
    });
    this.props.dispatch({
      type: 'groups/clearMembers',
      payload: {
        id: this.props.id,
      },
    });
  };

  updateGroup = (
    data: Partial<Pick<IGroup, 'name' | 'intro' | 'verified' | 'private' | 'joinChannel'>>,
  ) => {
    if (this.props.loadings.updateGroup) {
      return;
    }
    return this.props
      .dispatch({
        type: 'groups/updateGroup',
        payload: {
          id: this.props.id,
          data,
        },
      })
      .then((ret: IApiResponse) => {
        msg.auto(ret);
        if (ret.success) {
          tracker.event({
            category: 'groups',
            action: 'updateGroup',
          });
          msg.success('Updated');
          this.refreshGroupDetail();
        }
      });
  };

  dissolveGroup = () => {
    Modal.confirm({
      className: 'ant-modal-confirm-content-only',
      content: 'Dissolve Group? You can not redo this operation.',
      onOk: () => {
        if (this.props.loadings.deleteGroup) {
          return;
        }
        return this.props
          .dispatch({
            type: 'groups/deleteGroup',
            payload: {
              id: this.props.id,
            },
          })
          .then((ret: IApiResponse) => {
            msg.auto(ret);
            if (ret.success) {
              tracker.event({
                category: 'groups',
                action: 'dissolveGroup',
              });
              msg.success('Dissolved group');
              this.clearAllGroupState();
              router.replace({
                pathname: pages.groups.index,
              });
            }
          });
      },
    });
  };

  addGroupMembers = (userIds: number[]) => {
    if (this.props.loadings.addGroupMember) {
      return;
    }
    return this.props
      .dispatch({
        type: 'groups/addGroupMember',
        payload: {
          id: this.props.id,
          data: {
            userIds,
          },
        },
      })
      .then((ret: IApiResponse) => {
        msg.auto(ret);
        if (ret.success) {
          tracker.event({
            category: 'groups',
            action: 'addGroupMembers',
          });
          msg.success('Added');
          this.refreshGroupMembers();
        }
      });
  };

  approveGroupMember = (userId: number) => {
    if (this.props.loadings.updateGroupMember) {
      return;
    }
    return this.props
      .dispatch({
        type: 'groups/updateGroupMember',
        payload: {
          id: this.props.id,
          userId,
          data: {
            status: GroupMemberStatus.Normal,
          },
        },
      })
      .then((ret: IApiResponse) => {
        msg.auto(ret);
        if (ret.success) {
          tracker.event({
            category: 'groups',
            action: 'approveGroupMember',
          });
          msg.success('Approved');
          this.refreshGroupMembers();
        }
      });
  };

  updateGroupMember = (
    userId: number,
    data: Partial<Pick<IGroupMember, 'permission' | 'status'>>,
  ) => {
    if (this.props.loadings.updateGroupMember) {
      return;
    }
    return this.props
      .dispatch({
        type: 'groups/updateGroupMember',
        payload: {
          id: this.props.id,
          userId,
          data,
        },
      })
      .then((ret: IApiResponse) => {
        msg.auto(ret);
        if (ret.success) {
          tracker.event({
            category: 'groups',
            action: 'updateGroupMember',
          });
          msg.success('Updated');
          this.refreshGroupMembers();
        }
      });
  };

  removeGroupMember = (userId: number, type: 'remove' | 'reject') => {
    if (this.props.loadings.deleteGroupMember) {
      return;
    }
    return this.props
      .dispatch({
        type: 'groups/deleteGroupMember',
        payload: {
          id: this.props.id,
          userId,
        },
      })
      .then((ret: IApiResponse) => {
        msg.auto(ret);
        if (ret.success) {
          tracker.event({
            category: 'groups',
            action: type === 'reject' ? 'rejectGroupMember' : 'removeGroupMember',
          });
          msg.success(type === 'reject' ? 'Rejected' : 'Removed');
          this.refreshGroupMembers();
        }
      });
  };

  joinGroup = () => {
    if (this.props.loadings.joinGroup) {
      return;
    }
    return this.props
      .dispatch({
        type: 'groups/joinGroup',
        payload: {
          id: this.props.id,
        },
      })
      .then((ret: IApiResponse) => {
        msg.auto(ret);
        if (ret.success) {
          tracker.event({
            category: 'groups',
            action: 'joinGroup',
          });
          Modal.success({
            className: 'ant-modal-confirm-content-only',
            content:
              this.props.detail.joinChannel === GroupJoinChannel.Audit
                ? 'Request sent. Please wait for auditing.'
                : 'Join success.',
          });
          this.refreshGroupMembers();
        }
      });
  };

  quitGroup = () => {
    Modal.confirm({
      className: 'ant-modal-confirm-content-only',
      content: 'Quit Group?',
      onOk: () => {
        if (this.props.loadings.quitGroup) {
          return;
        }
        return this.props
          .dispatch({
            type: 'groups/quitGroup',
            payload: {
              id: this.props.id,
            },
          })
          .then((ret: IApiResponse) => {
            msg.auto(ret);
            if (ret.success) {
              tracker.event({
                category: 'groups',
                action: 'quitGroup',
              });
              msg.success('Quit group');
              this.clearAllGroupState();
              router.push({
                pathname: pages.groups.index,
              });
            }
          });
      },
    });
  };

  renderJoinButton = () => {
    const {
      session,
      detail,
      loadings: { joinGroup: loading },
    } = this.props;
    if (this.loading || !session.loggedIn) {
      return (
        <Button className="button-block-group" block type="primary" disabled>
          Join
        </Button>
      );
    }
    if (!this.isInGroup) {
      return (
        <Button
          className="button-block-group"
          block
          type="primary"
          loading={loading}
          disabled={detail.joinChannel === GroupJoinChannel.Invitation}
          onClick={this.joinGroup}
        >
          Join
        </Button>
      );
    }
    return null;
  };

  renderMembersImageView = () => {
    return this.members.map((m) => (
      <Popover
        key={m.groupMemberId}
        title={groupMemberPermissionMap[m.permission]?.name}
        content={m.user.nickname}
      >
        <Link
          to={urlf(pages.users.detail, { param: { id: m.user.userId } })}
          onClick={(e) => e.stopPropagation()}
          className="g-members-avatar"
        >
          <Avatar icon="user" src={formatAvatarUrl(m.user.avatar)} />
        </Link>
      </Popover>
    ));
  };

  handleMembersPageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
    const table = document.querySelector('._id_member-list');
    if (table) {
      const top = table.getBoundingClientRect().top + document.documentElement.scrollTop;
      window.scrollTo({
        top: top - constants.navbarHeight,
      });
    }
  };

  renderMembersListView = () => {
    const {
      id,
      loadings: { members: loading },
      members: { count },
      location: { query },
      session,
    } = this.props;

    return (
      <Table
        dataSource={this.members}
        rowKey="groupMemberId"
        loading={loading}
        className="responsive-table _id_member-list"
        pagination={{
          total: count,
          current: +query.page || 1,
          pageSize: limits.groups.members,
          onChange: this.handleMembersPageChange,
        }}
      >
        <Table.Column
          title="User"
          key="User"
          render={(text, record: IGroupMember) => <UserBar user={record.user} />}
        />
        <Table.Column
          title="Perm."
          key="Permission"
          render={(text, record: IGroupMember) => (
            <span>{groupMemberPermissionMap[record.permission]?.name}</span>
          )}
        />
        <Table.Column
          title="Joined At"
          key="Time"
          render={(text, record: IGroupMember) => <TimeBar time={record.joinedAt * 1000} />}
        />
        <Table.Column
          title={<div className="mr-md">Actions</div>}
          key="Actions"
          align="right"
          render={(text, record: IGroupMember) => {
            if (record.status === GroupMemberStatus.Auditing) {
              return (
                <span>
                  <a
                    className="mr-md text-success"
                    // @ts-ignore
                    disabled={!this.canOpMember(record)}
                    onClick={() => this.approveGroupMember(record.user.userId)}
                  >
                    Approve
                  </a>
                  <a
                    className="mr-md text-danger"
                    // @ts-ignore
                    disabled={!this.canOpMember(record)}
                    onClick={() => this.removeGroupMember(record.user.userId, 'reject')}
                  >
                    Reject
                  </a>
                </span>
              );
            } else {
              return (
                <span>
                  {/*
                  // @ts-ignore */}
                  <GeneralFormModal
                    loadingEffect="groups/updateGroupMember"
                    title="Edit Member"
                    autoMsg
                    disabled={!this.canOpMember(record)}
                    items={this.genGroupMemberFormItems(record)}
                    submit={(dispatch: ReduxProps['dispatch'], values) => {
                      tracker.event({
                        category: 'groups',
                        action: 'updateGroupMember',
                      });
                      const data = {
                        ...values,
                        permission: +values.permission,
                      };
                      return dispatch({
                        type: 'groups/updateGroupMember',
                        payload: {
                          id,
                          userId: record.user.userId,
                          data,
                        },
                      });
                    }}
                    onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                      msg.success('Update successfully');
                    }}
                    onSuccessModalClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                      dispatch({
                        type: 'groups/getMembers',
                        payload: {
                          id,
                          force: true,
                        },
                      });
                    }}
                  >
                    {/*
                    // @ts-ignore */}
                    <a className="mr-md" disabled={!this.canOpMember(record)}>
                      Edit
                    </a>
                  </GeneralFormModal>

                  <Popconfirm
                    title="Remove this member?"
                    placement="bottom"
                    onConfirm={() => this.removeGroupMember(record.user.userId, 'remove')}
                  >
                    <a
                      className="mr-md"
                      // @ts-ignore
                      disabled={!this.canOpMember(record)}
                    >
                      Remove
                    </a>
                  </Popconfirm>
                </span>
              );
            }
          }}
        />
      </Table>
    );
  };

  render() {
    const {
      id,
      loadings,
      detail,
      members: { count: membersCount, rows: membersRows },
      session,
    } = this.props;

    if (!loadings.detail && !detail.groupId) {
      return <NotFound />;
    }

    return (
      <PageTitle title={detail.name} loading={this.loading}>
        <div className="g-bbg">
          <div className="group-info">
            <h1 className="group-info-item display-flex">
              <div className="text-ellipsis">{detail.name}</div>
              {detail.verified && (
                <div className="verified-badge ml-sm-md" title="Verified">
                  V
                </div>
              )}
            </h1>
            <h3 className="group-info-item text-ellipsis">{detail.intro}</h3>
          </div>

          <div className="content-view" style={{ position: 'relative' }}>
            <PageAnimation>
              <div className="u-content">
                <Row gutter={16}>
                  <Col xs={24} md={18} xxl={18}>
                    <Card
                      bordered={false}
                      className={!loadings.members && this.hasAdminPerm ? 'list-card' : ''}
                    >
                      <div
                        id="members-card"
                        className="flex-justify-space-between"
                        style={
                          !loadings.members && this.hasAdminPerm
                            ? { padding: '16px 16px 0 16px' }
                            : {}
                        }
                      >
                        <h3 className="mb-md-lg">
                          Members ({membersCount})
                          {this.hasAdminPerm && this.auditingMembers.length > 0 ? (
                            <span className="text-danger ml-md-lg" style={{ fontSize: '14px' }}>
                              {this.auditingMembers.length} to audit
                            </span>
                          ) : null}
                        </h3>
                        {this.hasAdminPerm && (
                          <Button size="small">
                            <Icon type="plus" /> Member
                          </Button>
                        )}
                      </div>
                      <Skeleton
                        active
                        loading={loadings.members}
                        title={null}
                        paragraph={{ rows: 2, width: '100%' }}
                      >
                        {this.hasAdminPerm
                          ? this.renderMembersListView()
                          : this.renderMembersImageView()}
                      </Skeleton>
                    </Card>
                  </Col>

                  <Col xs={24} md={6} xxl={6}>
                    <Card bordered={false}>
                      {this.renderJoinButton()}
                      {this.hasAdminPerm && (
                        <GeneralFormModal
                          loadingEffect="groups/updateGroup"
                          title="Edit Info"
                          autoMsg
                          items={this.groupDetailFormItems}
                          className="button-block-group display-block"
                          submit={(dispatch: ReduxProps['dispatch'], values) => {
                            tracker.event({
                              category: 'groups',
                              action: 'updateGroup',
                            });
                            const data = {
                              ...values,
                              private: values.private === 'true',
                              joinChannel: +values.joinChannel,
                            };
                            values.verified && (data.verified = values.verified === 'true');
                            return dispatch({
                              type: 'groups/updateGroup',
                              payload: {
                                id,
                                data,
                              },
                            });
                          }}
                          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                            msg.success('Update successfully');
                          }}
                          onSuccessModalClosed={(
                            dispatch: ReduxProps['dispatch'],
                            ret: IApiResponse,
                          ) => {
                            dispatch({
                              type: 'groups/getDetail',
                              payload: {
                                id,
                                force: true,
                              },
                            });
                          }}
                        >
                          <Button block>Edit Info</Button>
                        </GeneralFormModal>
                      )}
                      {(this.isGroupMaster || isAdminDog(session)) && (
                        <Button
                          className="button-block-group"
                          block
                          type="danger"
                          loading={loadings.deleteGroup}
                          onClick={this.dissolveGroup}
                        >
                          Dissolve
                        </Button>
                      )}
                      {!this.isGroupMaster && this.isInGroup && (
                        <Button
                          className="button-block-group"
                          block
                          type="danger"
                          loading={loadings.quitGroup}
                          onClick={this.quitGroup}
                        >
                          Quit
                        </Button>
                      )}
                    </Card>
                  </Col>
                </Row>
              </div>
            </PageAnimation>
          </div>
        </div>
      </PageTitle>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.groups.detail);
  return {
    id,
    detail: state.groups.detail[id] || {},
    members: state.groups.members[id] || { count: 0, rows: [] },
    session: state.session,
    loadings: {
      detail: !!state.loading.effects['groups/getDetail'],
      members: !!state.loading.effects['groups/getMembers'],
      updateGroup: !!state.loading.effects['groups/updateGroup'],
      deleteGroup: !!state.loading.effects['groups/deleteGroup'],
      addGroupMember: !!state.loading.effects['groups/addGroupMember'],
      updateGroupMember: !!state.loading.effects['groups/updateGroupMember'],
      deleteGroupMember: !!state.loading.effects['groups/deleteGroupMember'],
      joinGroup: !!state.loading.effects['groups/joinGroup'],
      quitGroup: !!state.loading.effects['groups/quitGroup'],
    },
  };
}

export default connect(mapStateToProps)(GroupDetail);
