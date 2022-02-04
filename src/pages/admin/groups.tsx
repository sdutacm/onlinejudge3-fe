/**
 * title: Admin Groups
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
import { GroupJoinChannel, groupJoinChannels } from '@/configs/groups';
import ImportGroupModal from '@/components/ImportGroupModal';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IList<IGroup>;
  detailMap: ITypeObject<IGroup>;
  listLoading: boolean;
  detailLoading: boolean;
  submitLoading: boolean;
}

interface State {
  currentGroupId?: number;
}

class AdminGroupList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentGroupId: undefined,
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  editGroup = (groupId) => {
    this.setState(
      {
        currentGroupId: groupId,
      },
      () => {
        setTimeout(
          () =>
            this.props.dispatch({
              type: 'admin/getGroupDetail',
              payload: {
                id: groupId,
              },
            }),
          constants.drawerAnimationDuration,
        );
      },
    );
  };

  getGroupDetailFormItems(groupId?: number) {
    const { detailMap } = this.props;
    const detail = detailMap[groupId];
    const items: IGeneralFormItem[] = [
      {
        name: 'Name',
        field: 'name',
        component: 'input',
        initialValue: detail?.name || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Intro',
        field: 'intro',
        component: 'input',
        initialValue: detail?.intro || '',
        rules: [],
      },
      {
        name: 'Verified',
        field: 'verified',
        component: 'select',
        initialValue: `${!!(detail?.verified ?? false)}`,
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
        name: 'Private',
        field: 'private',
        component: 'select',
        initialValue: `${!!(detail?.private ?? false)}`,
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
        initialValue: `${detail?.joinChannel ?? GroupJoinChannel.Any}`,
        options: groupJoinChannels.map((jc) => ({
          value: jc.id,
          name: jc.name,
        })),
        rules: [{ required: true }],
      },
    ];
    return items;
  }

  getHandledDataFromForm(values) {
    return {
      ...values,
      verified: values.verified === 'true',
      private: values.private === 'true',
      joinChannel: +values.joinChannel,
    };
  }

  render() {
    const {
      listLoading,
      detailLoading,
      submitLoading,
      list: { page, count, rows },
      detailMap,
    } = this.props;
    const { currentGroupId } = this.state;
    const detail = detailMap[currentGroupId];
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="groupId"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: IGroup) => (
                    <span className={record.deleted ? 'text-secondary' : ''}>{record.groupId}</span>
                  )}
                />
                <Table.Column
                  title="Name"
                  key="Name"
                  render={(text, record: IGroup) => (
                    <div className="display-flex">
                      <div
                        className={
                          record.deleted ? 'text-ellipsis text-secondary' : 'text-ellipsis'
                        }
                      >
                        {record.name}
                      </div>
                      {record.verified && (
                        <div className="verified-badge ml-sm-md" title="Verified">
                          V
                        </div>
                      )}
                    </div>
                  )}
                />
                <Table.Column
                  title="Created at"
                  key="CreatedAt"
                  render={(text, record: IGroup) => (
                    <TimeBar time={new Date(record.createdAt).getTime()} />
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: IGroup) => {
                    if (record.deleted) {
                      return null;
                    }
                    return (
                      <div>
                        <GeneralFormDrawer
                          fetchLoading={
                            record.groupId === currentGroupId && (!detail || detailLoading)
                          }
                          loading={record.groupId === currentGroupId && submitLoading}
                          // fetchLoadingEffect="admin/getGroupDetail"
                          // loadingEffect="admin/updateGroupDetail"
                          title={`Edit Group #${record.groupId}`}
                          autoMsg
                          cancelText="Cancel (discard changes)"
                          width={600}
                          maskClosable={false}
                          items={this.getGroupDetailFormItems(record.groupId)}
                          submit={(dispatch: ReduxProps['dispatch'], values) => {
                            tracker.event({
                              category: 'admin',
                              action: 'updateGroup',
                            });
                            const data = this.getHandledDataFromForm(values);
                            console.log('data', data);
                            return dispatch({
                              type: 'admin/updateGroupDetail',
                              payload: {
                                id: record.groupId,
                                data,
                              },
                            });
                          }}
                          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                            msg.success('Update group successfully');
                          }}
                          onSuccessAndClosed={(
                            dispatch: ReduxProps['dispatch'],
                            ret: IApiResponse,
                          ) => {
                            dispatch({
                              type: 'admin/getGroupList',
                              payload: this.props.location.query,
                            });
                          }}
                        >
                          <a onClick={() => this.editGroup(record.groupId)}>Edit</a>
                        </GeneralFormDrawer>
                        <Link
                          to={urlf(pages.groups.detail, { param: { id: record.groupId } })}
                          target="_blank"
                          className="ml-md-lg"
                        >
                          View
                        </Link>
                      </div>
                    );
                  }}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.admin.groupList}
                showTotal={(total) => `${total} items`}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <ImportGroupModal>
                <Button block>Import Group</Button>
              </ImportGroupModal>
              <GeneralFormDrawer
                loadingEffect="admin/createGroup"
                title="Add Group"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getGroupDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createGroup',
                  });
                  const data = this.getHandledDataFromForm(values);
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createGroup',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ groupId: number }>,
                ) => {
                  msg.success(`Create group #${ret.data.groupId} successfully`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getGroupList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block className="mt-md">
                  Add Group
                </Button>
              </GeneralFormDrawer>
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Group ID', fieldName: 'groupId' },
                  { displayName: 'Name', fieldName: 'name' },
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
                  {
                    displayName: 'Private',
                    fieldName: 'private',
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
                  {
                    displayName: 'Join Channel',
                    fieldName: 'joinChannel',
                    options: groupJoinChannels.map((jc) => ({
                      displayName: jc.name,
                      fieldName: jc.id,
                    })),
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
    listLoading: !!state.loading.effects['admin/getGroupList'],
    detailLoading: !!state.loading.effects['admin/getGroupDetail'],
    submitLoading: !!state.loading.effects['admin/updateGroupDetail'],
    list: state.admin.groupList,
    detailMap: state.admin.groupDetail,
  };
}

export default connect(mapStateToProps)(AdminGroupList);
