/**
 * title: Admin Contests
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import router from 'umi/router';
import tracker from '@/utils/tracker';
import { Row, Col, Card, Table, Pagination, Button, Icon, Alert } from 'antd';
import limits from '@/configs/limits';
import FilterCard from '@/components/FilterCard';
import constants from '@/configs/constants';
import GeneralFormDrawer from '@/components/GeneralFormDrawer';
import msg from '@/utils/msg';
import { Link } from 'react-router-dom';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import { IGeneralFormItem } from '@/components/GeneralForm';
import moment from 'moment';
import contestTypes, { ContestTypes } from '@/configs/contestTypes';
import contestCategories, { ContestCategories } from '@/configs/contestCategories';
import contestModes, { ContestModes } from '@/configs/contestModes';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IList<IContest>;
  detailMap: ITypeObject<IContest>;
  listLoading: boolean;
  detailLoading: boolean;
  submitLoading: boolean;
}

interface State {
  currentContestId?: number;
}

class AdminContestList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentContestId: undefined,
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  editContest = (contestId) => {
    this.setState(
      {
        currentContestId: contestId,
      },
      () => {
        setTimeout(
          () =>
            this.props.dispatch({
              type: 'admin/getContestDetail',
              payload: {
                id: contestId,
              },
            }),
          constants.drawerAnimationDuration,
        );
      },
    );
  };

  getContestDetailFormItems(contestId?: number) {
    const { detailMap } = this.props;
    const detail = detailMap[contestId];
    const items: IGeneralFormItem[] = [
      {
        name: 'Title',
        field: 'title',
        component: 'input',
        initialValue: detail?.title || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Type',
        field: 'type',
        component: 'select',
        initialValue: `${detail?.type ?? ContestTypes.Public}`,
        options: contestTypes.map((p) => ({
          value: p.id,
          name: p.name,
        })),
        rules: [{ required: true }],
      },
      {
        name: 'Category',
        field: 'category',
        component: 'select',
        initialValue: `${detail?.category ?? ContestCategories.Test}`,
        options: contestCategories.map((p) => ({
          value: p.id,
          name: p.name,
        })),
        rules: [{ required: true }],
      },
      {
        name: 'Mode',
        field: 'mode',
        component: 'select',
        initialValue: `${detail?.mode ?? ContestModes.None}`,
        options: contestModes.map((p) => ({
          value: p.id,
          name: p.name,
        })),
        rules: [{ required: true }],
      },
      {
        name: 'Start at',
        field: 'startAt',
        component: 'datetime',
        initialValue: detail?.startAt || undefined,
        rules: [{ required: true }],
      },
      {
        name: 'End at',
        field: 'endAt',
        component: 'datetime',
        initialValue: detail?.endAt || undefined,
        rules: [{ required: true }],
      },
      {
        name: 'Register Start at (only for Register)',
        field: 'registerStartAt',
        component: 'datetime',
        initialValue: detail?.registerStartAt || undefined,
        rules: [],
      },
      {
        name: 'Register End at (only for Register)',
        field: 'registerEndAt',
        component: 'datetime',
        initialValue: detail?.registerEndAt || undefined,
        rules: [],
      },
      {
        name: 'Team Register (only for Register)',
        field: 'team',
        component: 'select',
        initialValue: `${!!(detail?.team ?? false)}`,
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
        name: 'Password (only for Private)',
        field: 'password',
        component: 'input',
        initialValue: detail?.password || '',
        rules: [],
      },
      {
        name: 'Description',
        field: 'description',
        component: 'richtext',
        initialValue: detail?.description || '',
        rules: [],
        contentStyle: { height: '250px' },
        uploadTarget: 'asset',
        uploadOption: {
          prefix: 'contest',
          maxSize: 32,
        },
      },
      {
        name: 'Frozen Length',
        field: 'frozenLength',
        component: 'input',
        initialValue: detail?.frozenLength || 0,
        placeholder: 'Seconds to frozen',
        rules: [],
      },
      {
        name: 'Hidden',
        field: 'hidden',
        component: 'select',
        initialValue: `${!!(detail?.hidden ?? false)}`,
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
    ];
    return items;
  }

  getHandledDataFromForm(values) {
    return {
      ...values,
      type: +values.type,
      category: +values.category,
      mode: +values.mode,
      startAt: values.startAt.toISOString(),
      endAt: values.endAt.toISOString(),
      registerStartAt: values.registerStartAt ? values.registerStartAt.toISOString() : null,
      registerEndAt: values.registerEndAt ? values.registerEndAt.toISOString() : null,
      team: values.team === 'true',
      description: values.description.toHTML(),
      frozenLength: +values.frozenLength || 0,
      hidden: values.hidden === 'true',
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
    const { currentContestId } = this.state;
    const detail = detailMap[currentContestId];
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} className="mb-lg">
            <Alert
              message="Contests is deprecated"
              description="Use Competitions for any formal competition or registration. This module should only be used to open reproduction or internal testing."
              type="info"
              showIcon
            />
          </Col>
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="contestId"
                loading={listLoading}
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
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: IContest) => (
                    <span className={!record.hidden ? '' : 'text-secondary'}>
                      {record.contestId}
                    </span>
                  )}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: IContest) => (
                    <span className={!record.hidden ? '' : 'text-secondary'}>{record.title}</span>
                  )}
                />
                <Table.Column
                  title="Time Range"
                  key="TimeRange"
                  render={(text, record: IContest) => (
                    <div className="nowrap">
                      <span>{moment(record.startAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                      <br />
                      <span>{moment(record.endAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </div>
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: IContest) => (
                    <div className="nowrap">
                      <GeneralFormDrawer
                        fetchLoading={
                          record.contestId === currentContestId && (!detail || detailLoading)
                        }
                        loading={record.contestId === currentContestId && submitLoading}
                        // fetchLoadingEffect="admin/getContestDetail"
                        // loadingEffect="admin/updateContestDetail"
                        title={`Edit Contest #${record.contestId}`}
                        autoMsg
                        cancelText="Cancel (discard changes)"
                        width={600}
                        maskClosable={false}
                        items={this.getContestDetailFormItems(record.contestId)}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          tracker.event({
                            category: 'admin',
                            action: 'updateContest',
                          });
                          const data = this.getHandledDataFromForm(values);
                          console.log('data', data);
                          return dispatch({
                            type: 'admin/updateContestDetail',
                            payload: {
                              id: record.contestId,
                              data,
                            },
                          });
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                          msg.success('Update contest successfully');
                        }}
                        onSuccessAndClosed={(
                          dispatch: ReduxProps['dispatch'],
                          ret: IApiResponse,
                        ) => {
                          dispatch({
                            type: 'admin/getContestList',
                            payload: this.props.location.query,
                          });
                        }}
                      >
                        <a onClick={() => this.editContest(record.contestId)}>Edit</a>
                      </GeneralFormDrawer>
                      <Link
                        to={urlf(pages.contests.home, { param: { id: record.contestId } })}
                        target="_blank"
                        className="ml-md-lg"
                      >
                        View
                      </Link>
                      <Link
                        to={urlf(pages.admin.contestProblems, { param: { id: record.contestId } })}
                        className="ml-md-lg"
                      >
                        Prob.
                      </Link>
                      {record.type === ContestTypes.Register && (
                        <Link
                          to={urlf(pages.admin.contestUsers, { param: { id: record.contestId } })}
                          className="ml-md-lg"
                        >
                          Users
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
                pageSize={limits.admin.contestList}
                showTotal={(total) => `${total} items`}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormDrawer
                loadingEffect="admin/createContest"
                title="Add Contest"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getContestDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createContest',
                  });
                  const data = this.getHandledDataFromForm(values);
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createContest',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ contestId: number }>,
                ) => {
                  msg.success(`Create contest #${ret.data.contestId} successfully`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getContestList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block>Add Contest</Button>
              </GeneralFormDrawer>
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Contest ID', fieldName: 'contestId' },
                  { displayName: 'Title', fieldName: 'title' },
                  {
                    displayName: 'Type',
                    fieldName: 'type',
                    options: contestTypes.map((res) => {
                      return { fieldName: res.id, displayName: res.name };
                    }),
                  },
                  {
                    displayName: 'Category',
                    fieldName: 'category',
                    options: contestCategories.map((res) => {
                      return { fieldName: res.id, displayName: res.name };
                    }),
                  },
                  {
                    displayName: 'Mode',
                    fieldName: 'mode',
                    options: contestModes.map((res) => {
                      return { fieldName: res.id, displayName: res.name };
                    }),
                  },
                  {
                    displayName: 'Hidden',
                    fieldName: 'hidden',
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
    listLoading: !!state.loading.effects['admin/getContestList'],
    detailLoading: !!state.loading.effects['admin/getContestDetail'],
    submitLoading: !!state.loading.effects['admin/updateContestDetail'],
    list: state.admin.contestList,
    detailMap: state.admin.contestDetail,
  };
}

export default connect(mapStateToProps)(AdminContestList);
