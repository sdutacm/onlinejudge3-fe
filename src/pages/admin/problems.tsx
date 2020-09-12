/**
 * title: Admin Problems
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import router from 'umi/router';
import tracker from '@/utils/tracker';
import { Row, Col, Card, Table, Popover, Tag, Pagination, Button } from 'antd';
import ProblemDifficulty from '@/components/ProblemDifficulty';
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
  list: IList<IProblem>;
  detailMap: ITypeObject<IProblem>;
  tagList: IFullList<ITag>;
  listLoading: boolean;
  detailLoading: boolean;
  submitLoading: boolean;
}

interface State {
  currentProblemId?: number;
}

class AdminProblemList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentProblemId: undefined,
    };
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  editProblem = (problemId) => {
    this.setState(
      {
        currentProblemId: problemId,
      },
      () => {
        setTimeout(
          () =>
            this.props.dispatch({
              type: 'admin/getProblemDetail',
              payload: {
                id: problemId,
              },
            }),
          constants.drawerAnimationDuration,
        );
      },
    );
  };

  getProblemDetailFormItems(problemId?: number) {
    const { detailMap } = this.props;
    const detail = detailMap[problemId];
    const items: IGeneralFormItem[] = [
      {
        name: 'Title',
        field: 'title',
        component: 'input',
        initialValue: detail?.title || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Time Limit (ms)',
        field: 'timeLimit',
        component: 'input',
        initialValue: detail?.timeLimit || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Memory Limit (KiB)',
        field: 'memoryLimit',
        component: 'input',
        initialValue: detail?.memoryLimit || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Source',
        field: 'source',
        component: 'input',
        initialValue: detail?.source || '',
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
          prefix: 'problem',
          maxSize: 32,
        },
      },
      {
        name: 'Input',
        field: 'input',
        component: 'richtext',
        initialValue: detail?.input || '',
        rules: [],
        contentStyle: { height: '250px' },
        uploadTarget: 'asset',
        uploadOption: {
          prefix: 'problem',
          maxSize: 32,
        },
      },
      {
        name: 'Output',
        field: 'output',
        component: 'richtext',
        initialValue: detail?.output || '',
        rules: [],
        contentStyle: { height: '250px' },
        uploadTarget: 'asset',
        uploadOption: {
          prefix: 'problem',
          maxSize: 32,
        },
      },
      {
        name: 'Sample Input',
        field: 'sampleInput',
        component: 'textarea',
        initialValue: detail?.sampleInput || '',
        rules: [],
        rows: 5,
      },
      {
        name: 'Sample Output',
        field: 'sampleOutput',
        component: 'textarea',
        initialValue: detail?.sampleOutput || '',
        rules: [],
        rows: 5,
      },
      {
        name: 'Hint',
        field: 'hint',
        component: 'richtext',
        initialValue: detail?.hint || '',
        rules: [],
        contentStyle: { height: '250px' },
        uploadTarget: 'asset',
        uploadOption: {
          prefix: 'problem',
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
      timeLimit: +values.timeLimit,
      memoryLimit: +values.memoryLimit,
      description: values.description.toHTML(),
      input: values.input.toHTML(),
      output: values.output.toHTML(),
      hint: values.hint.toHTML(),
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
    const { currentProblemId } = this.state;
    const detail = detailMap[currentProblemId];
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="problemId"
                loading={listLoading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title=""
                  key="Difficulty"
                  width={48}
                  className="text-right"
                  render={(text, record: IProblem) => (
                    <ProblemDifficulty difficulty={record.difficulty} />
                  )}
                />
                <Table.Column
                  title="ID"
                  key="ID"
                  width={48}
                  render={(text, record: IProblem) => (
                    <span className={record.display ? '' : 'text-secondary'}>
                      {record.problemId}
                    </span>
                  )}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: IProblem) => (
                    <div>
                      <span className={record.display ? '' : 'text-secondary'}>{record.title}</span>
                      {record.tags.length ? (
                        <div className="float-right">
                          {record.tags.map((tag) => (
                            <Popover
                              key={tag.tagId}
                              content={`${tag.nameEn} / ${tag.nameZhHans} / ${tag.nameZhHant}`}
                            >
                              <Tag>{tag.nameEn}</Tag>
                            </Popover>
                          ))}
                        </div>
                      ) : (
                        <div className="float-right" style={{ visibility: 'hidden' }}>
                          <Tag>&nbsp;</Tag>
                        </div>
                      )}
                    </div>
                  )}
                />
                <Table.Column
                  title="Added at"
                  key="CreatedAt"
                  render={(text, record: IProblem) => (
                    <TimeBar time={new Date(record.createdAt).getTime()} />
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: IProblem) => (
                    <div>
                      <GeneralFormDrawer
                        fetchLoading={
                          record.problemId === currentProblemId && (!detail || detailLoading)
                        }
                        loading={record.problemId === currentProblemId && submitLoading}
                        // fetchLoadingEffect="admin/getProblemDetail"
                        // loadingEffect="admin/updateProblemDetail"
                        title={`Edit Problem #${record.problemId}`}
                        autoMsg
                        cancelText="Cancel (discard changes)"
                        width={600}
                        maskClosable={false}
                        items={this.getProblemDetailFormItems(record.problemId)}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          tracker.event({
                            category: 'admin',
                            action: 'updateProblem',
                          });
                          const data = this.gethandledDataFromForm(values);
                          console.log('data', data);
                          return dispatch({
                            type: 'admin/updateProblemDetail',
                            payload: {
                              id: record.problemId,
                              data,
                            },
                          });
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                          msg.success('Update problem successfully');
                        }}
                        onSuccessAndClosed={(
                          dispatch: ReduxProps['dispatch'],
                          ret: IApiResponse,
                        ) => {
                          dispatch({
                            type: 'admin/getProblemList',
                            payload: this.props.location.query,
                          });
                        }}
                      >
                        <a onClick={() => this.editProblem(record.problemId)}>Edit</a>
                      </GeneralFormDrawer>
                      {record.display && (
                        <Link
                          to={urlf(pages.problems.detail, { param: { id: record.problemId } })}
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
                pageSize={limits.admin.problemList}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormDrawer
                loadingEffect="admin/createProblem"
                title="Add Problem"
                autoMsg
                cancelText="Cancel"
                width={600}
                maskClosable={false}
                items={this.getProblemDetailFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  tracker.event({
                    category: 'admin',
                    action: 'createProblem',
                  });
                  const data = this.gethandledDataFromForm(values);
                  console.log('data', data);
                  return dispatch({
                    type: 'admin/createProblem',
                    payload: {
                      data,
                    },
                  });
                }}
                onSuccess={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<{ problemId: number }>,
                ) => {
                  msg.success(`Create problem #${ret.data.problemId} successfully`);
                }}
                onSuccessAndClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                  dispatch({
                    type: 'admin/getProblemList',
                    payload: this.props.location.query,
                  });
                }}
              >
                <Button block>Add Problem</Button>
              </GeneralFormDrawer>
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Problem ID', fieldName: 'problemId' },
                  { displayName: 'Title', fieldName: 'title' },
                  { displayName: 'Source', fieldName: 'source' },
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
    listLoading: !!state.loading.effects['admin/getProblemList'],
    detailLoading: !!state.loading.effects['admin/getProblemDetail'],
    submitLoading: !!state.loading.effects['admin/updateProblemDetail'],
    list: state.admin.problemList,
    detailMap: state.admin.problemDetail,
    tagList: state.admin.tagList,
  };
}

export default connect(mapStateToProps)(AdminProblemList);
