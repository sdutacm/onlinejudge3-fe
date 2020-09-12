/**
 * title: Admin Posts
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

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  list: IList<IPost>;
  detailMap: ITypeObject<IPost>;
  listLoading: boolean;
  detailLoading: boolean;
  submitLoading: boolean;
}

interface State {
  currentPostId?: number;
}

class AdminPostList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentPostId: undefined,
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  editPost = (postId) => {
    this.setState(
      {
        currentPostId: postId,
      },
      () => {
        setTimeout(
          () =>
            this.props.dispatch({
              type: 'admin/getPostDetail',
              payload: {
                id: postId,
              },
            }),
          constants.drawerAnimationDuration,
        );
      },
    );
  };

  getPostDetailFormItems(postId?: number) {
    const { detailMap } = this.props;
    const detail = detailMap[postId];
    const items: IGeneralFormItem[] = [
      {
        name: 'Title',
        field: 'title',
        component: 'input',
        initialValue: detail?.title || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Content',
        field: 'content',
        component: 'richtext',
        initialValue: detail?.content || '',
        rules: [],
        contentStyle: { height: '250px' },
        uploadTarget: 'asset',
        uploadOption: {
          prefix: 'post',
          maxSize: 32,
        },
      },
      {
        name: 'Display',
        field: 'display',
        component: 'select',
        initialValue: `${!!(detail?.display ?? true)}`,
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

  gethandledDataFromForm(values) {
    return {
      ...values,
      content: values.content.toHTML(),
      display: values.display === 'true',
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
    const { currentPostId } = this.state;
    const detail = detailMap[currentPostId];
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="postId"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: IPost) => (
                    <span className={record.display ? '' : 'text-secondary'}>{record.postId}</span>
                  )}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: IPost) => (
                      <span className={record.display ? '' : 'text-secondary'}>{record.title}</span>
                  )}
                />
                <Table.Column
                  title="Added at"
                  key="CreatedAt"
                  render={(text, record: IPost) => (
                    <TimeBar time={new Date(record.createdAt).getTime()} />
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: IPost) => (
                    <div>
                      <GeneralFormDrawer
                        fetchLoading={record.postId === currentPostId && (!detail || detailLoading)}
                        loading={record.postId === currentPostId && submitLoading}
                        // fetchLoadingEffect="admin/getPostDetail"
                        // loadingEffect="admin/updatePostDetail"
                        title={`Edit Post #${record.postId}`}
                        autoMsg
                        cancelText="Cancel (discard changes)"
                        width={600}
                        maskClosable={false}
                        items={this.getPostDetailFormItems(record.postId)}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          tracker.event({
                            category: 'admin',
                            action: 'updatePost',
                          });
                          const data = this.gethandledDataFromForm(values);
                          console.log('data', data);
                          return dispatch({
                            type: 'admin/updatePostDetail',
                            payload: {
                              id: record.postId,
                              data,
                            },
                          });
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                          msg.success('Update post successfully');
                        }}
                        onSuccessAndClosed={(
                          dispatch: ReduxProps['dispatch'],
                          ret: IApiResponse,
                        ) => {
                          dispatch({
                            type: 'admin/getPostList',
                            payload: this.props.location.query,
                          });
                        }}
                      >
                        <a onClick={() => this.editPost(record.postId)}>Edit</a>
                      </GeneralFormDrawer>
                      {record.display && (
                        <Link
                          to={urlf(pages.posts.detail, { param: { id: record.postId } })}
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
                pageSize={limits.admin.postList}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormDrawer
                loadingEffect="admin/createPost"
                title="Add Post"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getPostDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createPost',
                  });
                  const data = this.gethandledDataFromForm(values);
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createPost',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ postId: number }>,
                ) => {
                  msg.success(`Create post #${ret.data.postId} successfully`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getPostList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block>Add Post</Button>
              </GeneralFormDrawer>
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Post ID', fieldName: 'postId' },
                  { displayName: 'Title', fieldName: 'title' },
                  {
                    displayName: 'Display',
                    fieldName: 'display',
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
    listLoading: !!state.loading.effects['admin/getPostList'],
    detailLoading: !!state.loading.effects['admin/getPostDetail'],
    submitLoading: !!state.loading.effects['admin/updatePostDetail'],
    list: state.admin.postList,
    detailMap: state.admin.postDetail,
  };
}

export default connect(mapStateToProps)(AdminPostList);
