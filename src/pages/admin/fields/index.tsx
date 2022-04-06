/**
 * title: Admin Fields
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import router from 'umi/router';
import tracker from '@/utils/tracker';
import { Row, Col, Card, Table, Pagination, Button, Popconfirm } from 'antd';
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
import { checkPerms } from '@/utils/permission';
import { EPerm } from '@/common/configs/perm.config';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IList<IField>;
  detailMap: ITypeObject<IField>;
  listLoading: boolean;
  detailLoading: boolean;
  submitLoading: boolean;
}

interface State {
  currentFieldId?: number;
}

class AdminFieldList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentFieldId: undefined,
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  editField = (fieldId) => {
    this.setState(
      {
        currentFieldId: fieldId,
      },
      () => {
        setTimeout(
          () =>
            this.props.dispatch({
              type: 'admin/getFieldDetail',
              payload: {
                id: fieldId,
              },
            }),
          constants.drawerAnimationDuration,
        );
      },
    );
  };

  deleteField = (fieldId) => {
    this.props
      .dispatch({
        type: 'admin/deleteField',
        payload: {
          id: fieldId,
        },
      })
      .then((ret: IApiResponse) => {
        msg.auto(ret);
        if (ret.success) {
          tracker.event({
            category: 'field',
            action: 'deleteField',
          });
          msg.success('Deleted');
          this.props.dispatch({
            type: 'admin/getFieldList',
            payload: this.props.location.query,
          });
        }
      });
  };

  getFieldDetailFormItems(fieldId?: number) {
    const { detailMap } = this.props;
    const detail = detailMap[fieldId];
    const items: IGeneralFormItem[] = [
      {
        name: 'Name',
        field: 'name',
        component: 'input',
        initialValue: detail?.name || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Short Name (only [A-Z0-9])',
        field: 'shortName',
        component: 'input',
        initialValue: detail?.shortName || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
    ];
    return items;
  }

  getHandledDataFromForm(values) {
    return {
      ...values,
    };
  }

  render() {
    const {
      session,
      listLoading,
      detailLoading,
      submitLoading,
      list: { page, count, rows },
      detailMap,
    } = this.props;
    const { currentFieldId } = this.state;
    const detail = detailMap[currentFieldId];
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="fieldId"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: IField) => <span>{record.fieldId}</span>}
                />
                <Table.Column
                  title="Name"
                  key="Name"
                  render={(text, record: IField) => <span>{record.name}</span>}
                />
                <Table.Column
                  title="Short Name"
                  key="Short Name"
                  render={(text, record: IField) => <span>{record.shortName}</span>}
                />
                <Table.Column
                  title="Added at"
                  key="CreatedAt"
                  render={(text, record: IField) => (
                    <TimeBar time={new Date(record.createdAt).getTime()} />
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: IField) => (
                    <div>
                      <GeneralFormDrawer
                        fetchLoading={
                          record.fieldId === currentFieldId && (!detail || detailLoading)
                        }
                        loading={record.fieldId === currentFieldId && submitLoading}
                        // fetchLoadingEffect="admin/getFieldDetail"
                        // loadingEffect="admin/updateFieldDetail"
                        title={`Edit Field #${record.fieldId}`}
                        autoMsg
                        cancelText="Cancel (discard changes)"
                        width={600}
                        maskClosable={false}
                        items={this.getFieldDetailFormItems(record.fieldId)}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          tracker.event({
                            category: 'admin',
                            action: 'updateField',
                          });
                          const data = this.getHandledDataFromForm(values);
                          console.log('data', data);
                          return dispatch({
                            type: 'admin/updateFieldDetail',
                            payload: {
                              id: record.fieldId,
                              data,
                            },
                          });
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                          msg.success('Update field successfully');
                        }}
                        onSuccessAndClosed={(
                          dispatch: ReduxProps['dispatch'],
                          ret: IApiResponse,
                        ) => {
                          dispatch({
                            type: 'admin/getFieldList',
                            payload: this.props.location.query,
                          });
                        }}
                      >
                        <a onClick={() => this.editField(record.fieldId)}>Edit</a>
                      </GeneralFormDrawer>
                      {
                        <Link
                          to={urlf(pages.admin.fieldSettings, { param: { id: record.fieldId } })}
                          className="ml-md-lg"
                        >
                          Settings
                        </Link>
                      }
                      {checkPerms(session, EPerm.DeleteField) ? (
                        <Popconfirm
                          title="Delete this field?"
                          placement="bottom"
                          onConfirm={() => this.deleteField(record.fieldId)}
                        >
                          <a className="ml-lg normal-text-link text-danger">Delete</a>
                        </Popconfirm>
                      ) : null}
                    </div>
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.admin.fieldList}
                showTotal={(total) => `${total} items`}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormDrawer
                loadingEffect="admin/createField"
                title="Add Field"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getFieldDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createField',
                  });
                  const data = this.getHandledDataFromForm(values);
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createField',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ fieldId: number }>,
                ) => {
                  msg.success(`Create field #${ret.data.fieldId} successfully`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getFieldList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block>Add Field</Button>
              </GeneralFormDrawer>
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Field ID', fieldName: 'fieldId' },
                  { displayName: 'Name', fieldName: 'name' },
                  { displayName: 'ShortName', fieldName: 'shortName' },
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
    listLoading: !!state.loading.effects['admin/getFieldList'],
    detailLoading: !!state.loading.effects['admin/getFieldDetail'],
    submitLoading: !!state.loading.effects['admin/updateFieldDetail'],
    list: state.admin.fieldList,
    detailMap: state.admin.fieldDetail,
  };
}

export default connect(mapStateToProps)(AdminFieldList);
