/**
 * title: Admin Tags
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import router from 'umi/router';
import tracker from '@/utils/tracker';
import { Row, Col, Card, Table, Button } from 'antd';
import GeneralFormDrawer from '@/components/GeneralFormDrawer';
import msg from '@/utils/msg';
import TimeBar from '@/components/TimeBar';
import { IGeneralFormItem } from '@/components/GeneralForm';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IList<ITag>;
  listLoading: boolean;
  submitLoading: boolean;
}

interface State {
  currentTagId?: number;
}

class AdminTagList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentTagId: undefined,
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  editTag = (tagId) => {
    this.setState({
      currentTagId: tagId,
    });
  };

  getTagDetailFormItems(tagId?: number) {
    const {
      list: { rows },
    } = this.props;
    const detail = rows.find((d) => d.tagId === tagId);
    const items: IGeneralFormItem[] = [
      {
        name: 'Name (English)',
        field: 'nameEn',
        component: 'input',
        initialValue: detail?.nameEn || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: '名称（简体中文）',
        field: 'nameZhHans',
        component: 'input',
        initialValue: detail?.nameZhHans || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: '名稱（繁體中文）',
        field: 'nameZhHant',
        component: 'input',
        initialValue: detail?.nameZhHant || '',
        rules: [{ required: true, message: 'Please input the field' }],
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
      hidden: values.hidden === 'true',
    };
  }

  render() {
    const {
      listLoading,
      submitLoading,
      list: { page, count, rows },
    } = this.props;
    const { currentTagId } = this.state;
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="tagId"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: ITag) => (
                    <span className={!record.hidden ? '' : 'text-secondary'}>{record.tagId}</span>
                  )}
                />
                <Table.Column
                  title="Name"
                  key="Name"
                  render={(text, record: ITag) => (
                    <span
                      className={!record.hidden ? '' : 'text-secondary'}
                    >{`${record.nameEn} / ${record.nameZhHans} / ${record.nameZhHant}`}</span>
                  )}
                />
                <Table.Column
                  title="Added at"
                  key="CreatedAt"
                  render={(text, record: ITag) => (
                    <TimeBar time={new Date(record.createdAt).getTime()} />
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: ITag) => (
                    <div>
                      <GeneralFormDrawer
                        loading={record.tagId === currentTagId && submitLoading}
                        // fetchLoadingEffect="admin/getTagDetail"
                        // loadingEffect="admin/updateTagDetail"
                        title={`Edit Tag #${record.tagId}`}
                        autoMsg
                        cancelText="Cancel (discard changes)"
                        width={600}
                        maskClosable={false}
                        items={this.getTagDetailFormItems(record.tagId)}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          tracker.event({
                            category: 'admin',
                            action: 'updateTag',
                          });
                          const data = this.getHandledDataFromForm(values);
                          console.log('data', data);
                          return dispatch({
                            type: 'admin/updateTagDetail',
                            payload: {
                              id: record.tagId,
                              data,
                            },
                          });
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                          msg.success('Update tag successfully');
                        }}
                        onSuccessAndClosed={(
                          dispatch: ReduxProps['dispatch'],
                          ret: IApiResponse,
                        ) => {
                          dispatch({
                            type: 'admin/getTagList',
                            payload: this.props.location.query,
                          });
                        }}
                      >
                        <a onClick={() => this.editTag(record.tagId)}>Edit</a>
                      </GeneralFormDrawer>
                    </div>
                  )}
                />
              </Table>
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormDrawer
                loadingEffect="admin/createTag"
                title="Add Tag"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getTagDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createTag',
                  });
                  const data = this.getHandledDataFromForm(values);
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createTag',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ tagId: number }>,
                ) => {
                  msg.success(`Create tag #${ret.data.tagId} successfully`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getTagList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block>Add Tag</Button>
              </GeneralFormDrawer>
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
    listLoading: !!state.loading.effects['admin/getTagList'],
    submitLoading: !!state.loading.effects['admin/updateTagDetail'],
    list: state.admin.tagList,
  };
}

export default connect(mapStateToProps)(AdminTagList);
