/**
 * title: Admin Contest Problems
 */

import React from 'react';
import { connect } from 'dva';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { getPathParamId } from '@/utils/getPathParams';
import { Row, Col, Card, Table, Input, Icon, Button } from 'antd';
import { numberToAlphabet } from '@/utils/format';
import { isEqual, noop } from 'lodash';
import classNames from 'classnames';
import AddItemByIdCard from '@/components/AddItemByIdCard';
import msg from '@/utils/msg';

interface IProblemConfig {
  problemId: number;
  title: string;
  originalTitle?: string;
}

export interface Props extends ReduxProps, RouteProps {
  id: number;
  problems: IProblemConfig[];
  contestDetail: IContest;
  detailLoading: boolean;
  submitLoading: boolean;
}

interface State {
  data: IProblemConfig[];
}

class AdminContestProblemList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.problems,
    };
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if (!isEqual(p.problems, np.problems)) {
      this.setState({
        data: np.problems,
      });
    }
  }

  handleTitleChange = (title, index) => {
    console.log(title, index);
    const newData = [...this.state.data];
    newData.splice(index, 1, {
      ...this.state.data[index],
      title,
    });
    this.setState({
      data: newData,
    });
  };

  handleMove = (fromIndex, toIndex) => {
    if (fromIndex > toIndex) {
      [toIndex, fromIndex] = [fromIndex, toIndex];
    }
    const { data } = this.state;
    const fromItem = data[fromIndex];
    const toItem = data[toIndex];
    this.setState({
      data: [
        ...data.slice(0, fromIndex),
        toItem,
        ...data.slice(fromIndex + 1, toIndex),
        fromItem,
        ...data.slice(toIndex + 1),
      ],
    });
  };

  handleAdd = (problemId: number) => {
    const { dispatch } = this.props;
    if (this.state.data.find((item) => item.problemId === problemId)) {
      msg.error('You have already added this problem');
      return;
    }
    dispatch({
      type: 'admin/getProblemDetail',
      payload: {
        id: problemId,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        this.setState({
          data: [
            ...this.state.data,
            {
              problemId,
              title: '',
              originalTitle: ret.data?.title || '',
            },
          ],
        });
      }
    });
  };

  handleDelete = (index) => {
    const newData = [...this.state.data];
    newData.splice(index, 1);
    this.setState({
      data: newData,
    });
  };

  handleSave = () => {
    const { id, dispatch } = this.props;
    dispatch({
      type: 'admin/setContestProblemConfig',
      payload: {
        id,
        problems: this.state.data.map((item) => ({
          problemId: item.problemId,
          title: item.title,
        })),
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Saved');
        dispatch({
          type: 'admin/getContestProblemConfig',
          payload: {
            id,
          },
        });
      }
    });
  };

  handleRejudge = (problemId) => {
    const { id, dispatch } = this.props;
    dispatch({
      type: 'admin/rejudgeSolution',
      payload: {
        contestId: id,
        problemId,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Rejudged');
      }
    });
  };

  getContestProblemConfig = (contestId) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'admin/getContestProblemConfig',
      payload: {
        id: contestId,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        return ret.data?.rows || [];
      }
      return [];
    });
  };

  cloneContestProblems = (contestId) => {
    this.getContestProblemConfig(contestId).then((ret) => {
      if (ret.length) {
        msg.success('Clone successfully');
        this.setState({
          data: [
            ...this.state.data,
            ...ret.filter(r => !this.state.data.find(p => p.problemId === r.problemId)),
          ],
        });
      }
    });
  };

  render() {
    const { loading, id, contestDetail } = this.props;
    const { data } = this.state;
    return (
      <PageAnimation>
        <h4 className="mb-md-lg">
          Problems of {id} - {contestDetail.title}
        </h4>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={data}
                rowKey="problemId"
                loading={loading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title=""
                  key="Alias"
                  render={(text, record: IProblemConfig, index) => (
                    <span>{numberToAlphabet(index)}</span>
                  )}
                />
                <Table.Column
                  title="ID"
                  key="ID"
                  render={(text, record: IProblemConfig) => <span>{record.problemId}</span>}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: IProblemConfig, index) => (
                    <div>
                      <Input
                        value={record.title}
                        onChange={(e) => this.handleTitleChange(e.target.value, index)}
                        placeholder={record.originalTitle}
                      />
                    </div>
                  )}
                />
                <Table.Column
                  title="Actions"
                  key="Actions"
                  render={(text, record: IProblemConfig, index) => (
                    <div className="nowrap">
                      <a
                        className={classNames({ 'text-disabled': index === 0 })}
                        onClick={index === 0 ? noop : () => this.handleMove(index, index - 1)}
                      >
                        <Icon type="up" />
                      </a>
                      <a
                        className={classNames(
                          { 'text-disabled': index === data.length - 1 },
                          'ml-md-lg',
                        )}
                        onClick={
                          index === data.length - 1 ? noop : () => this.handleMove(index, index + 1)
                        }
                      >
                        <Icon type="down" />
                      </a>
                      <a className="ml-md-lg" onClick={() => this.handleRejudge(record.problemId)}>
                        Rejudge
                      </a>
                      <a className="ml-md-lg text-danger" onClick={() => this.handleDelete(index)}>
                        Delete
                      </a>
                    </div>
                  )}
                />
              </Table>
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <Button block type="primary" onClick={this.handleSave}>
                Save
              </Button>
            </Card>
            <Card bordered={false}>
              <AddItemByIdCard
                label="Add Problem"
                placeholder="Problem ID"
                onAdd={this.handleAdd}
              />
            </Card>
            <Card bordered={false}>
              <AddItemByIdCard
                label="Clone Problems"
                placeholder="Contest ID"
                buttonText="Clone"
                onAdd={this.cloneContestProblems}
              />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.admin.contestHome);
  return {
    id,
    loading: !!state.loading.effects['admin/getContestProblemConfig'],
    problems: state.admin.contestProblems[id] || [],
    detailLoading: !!state.loading.effects['admin/getContestDetail'],
    submitLoading: !!state.loading.effects['admin/setContestProblemConfig'],
    contestDetail: state.admin.contestDetail[id] || {},
  };
}

export default connect(mapStateToProps)(AdminContestProblemList);
