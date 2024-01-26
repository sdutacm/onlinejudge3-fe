/**
 * title: Admin Competitions
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import router from 'umi/router';
import tracker from '@/utils/tracker';
import { Row, Col, Card, Table, Pagination, Button, Icon } from 'antd';
import limits from '@/configs/limits';
import FilterCard from '@/components/FilterCard';
import GeneralFormDrawer from '@/components/GeneralFormDrawer';
import msg from '@/utils/msg';
import { Link } from 'react-router-dom';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import { IGeneralFormItem } from '@/components/GeneralForm';
import moment from 'moment';
import { ICompetition } from '@/common/interfaces/competition';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IList<ICompetition>;
  listLoading: boolean;
}

interface State {
}

class AdminCompetitionList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  getCompetitionDetailFormItems() {
    const detail = undefined;
    const items: IGeneralFormItem[] = [
      {
        name: 'Title',
        field: 'title',
        component: 'input',
        initialValue: detail?.title || '',
        rules: [{ required: true, message: 'Please input the field' }],
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
        name: 'Rule',
        field: 'rule',
        component: 'select',
        initialValue: detail?.rule ?? 'ICPC',
        options: [
          {
            value: 'ICPC',
            name: 'ICPC',
          },
          {
            value: 'ICPCWithScore',
            name: 'ICPC + Score',
          },
        ],
        rules: [{ required: true }],
      },
      {
        name: 'Rating Mode',
        field: 'isRating',
        component: 'select',
        initialValue: `${!!(detail?.isRating ?? false)}`,
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
        name: 'Team Competition',
        field: 'isTeam',
        component: 'select',
        initialValue: `${!!(detail?.isTeam ?? false)}`,
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
        name: 'Introduction',
        field: 'introduction',
        component: 'richtext',
        initialValue: detail?.introduction || '',
        rules: [],
        contentStyle: { height: '250px' },
        uploadTarget: 'asset',
        uploadOption: {
          prefix: 'competition',
          maxSize: 32,
        },
      },
      // {
      //   name: 'Frozen Length',
      //   field: 'frozenLength',
      //   component: 'input',
      //   initialValue: detail?.frozenLength || 0,
      //   placeholder: 'Seconds to frozen',
      //   rules: [],
      // },
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
      startAt: values.startAt.toISOString(),
      endAt: values.endAt.toISOString(),
      registerStartAt: values.registerStartAt ? values.registerStartAt.toISOString() : null,
      registerEndAt: values.registerEndAt ? values.registerEndAt.toISOString() : null,
      rule: values.rule,
      isTeam: values.isTeam === 'true',
      isRating: values.isRating === 'true',
      introduction: values.introduction.toHTML(),
      // frozenLength: +values.frozenLength || 0,
      hidden: values.hidden === 'true',
      spConfig: {},
    };
  }

  render() {
    const {
      listLoading,
      list: { page, count, rows },
    } = this.props;
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="competitionId"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title=""
                  key="Type"
                  className="text-right td-icon"
                  render={(text, record: ICompetition) => (
                    <span>
                      {record.isTeam && <Icon type="team" />}
                    </span>
                  )}
                />
                <Table.Column
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: ICompetition) => (
                    <span className={!record.hidden ? '' : 'text-secondary'}>
                      {record.competitionId}
                    </span>
                  )}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: ICompetition) => (
                    <span className={!record.hidden ? '' : 'text-secondary'}>{record.title}</span>
                  )}
                />
                <Table.Column
                  title="Time Range"
                  key="TimeRange"
                  render={(text, record: ICompetition) => (
                    <div className="nowrap">
                      <span>{moment(record.startAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                      <br />
                      <span>{moment(record.endAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </div>
                  )}
                />
                 <Table.Column
                  title="Creator"
                  key="CreatedBy"
                  width={48}
                  render={(text, record: ICompetition) => (
                    <span>
                      {record.createdBy}
                    </span>
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: ICompetition) => (
                    <div className="nowrap">
                      <Link
                        to={urlf(pages.competitions.home, { param: { id: record.competitionId } })}
                        target="_blank"
                        className="ml-md-lg"
                      >
                        Manage
                      </Link>
                    </div>
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.admin.competitionList}
                showTotal={(total) => `${total} items`}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormDrawer
                loadingEffect="admin/createCompetition"
                title="Add Competition"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getCompetitionDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createCompetition',
                  });
                  const data = this.getHandledDataFromForm(values);
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createCompetition',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ competitionId: number }>,
                ) => {
                  msg.success(`Created, please manage to confirm settings`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getCompetitionList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block>Add Competition</Button>
              </GeneralFormDrawer>
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Competition ID', fieldName: 'competitionId' },
                  { displayName: 'Title', fieldName: 'title' },
                  {
                    displayName: 'Team',
                    fieldName: 'isTeam',
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
                  // {
                  //   displayName: 'Hidden',
                  //   fieldName: 'hidden',
                  //   options: [
                  //     {
                  //       displayName: 'Yes',
                  //       fieldName: true,
                  //     },
                  //     {
                  //       displayName: 'No',
                  //       fieldName: false,
                  //     },
                  //   ],
                  // },
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
    listLoading: !!state.loading.effects['admin/getCompetitionList'],
    list: state.admin.competitionList,
  };
}

export default connect(mapStateToProps)(AdminCompetitionList);
