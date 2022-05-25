/**
 * title: Competition Problem Settings
 */

import React from 'react';
import { connect } from 'dva';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { getPathParamId } from '@/utils/getPathParams';
import { Button, Form, Row, Col, Card, Table, Input, Icon } from 'antd';
import msg from '@/utils/msg';
import PageLoading from '@/components/PageLoading';
import { isEqual, noop } from 'lodash';
import { numberToAlphabet } from '@/utils/format';
import AddItemByIdCard from '@/components/AddItemByIdCard';
import classNames from 'classnames';

interface IProblemConfig {
  problemId: number;
  balloonAlias: string;
  balloonColor: string;
  title: string;
}

export interface Props extends ReduxProps, RouteProps {
  id: number;
  problems: IProblemConfig[];
  submitLoading: boolean;
}

interface State {
  data: IProblemConfig[];
}

class CompetitionProblemSettings extends React.Component<Props, State> {
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

  handleBalloonAliasChange = (value, index) => {
    const newData = [...this.state.data];
    newData.splice(index, 1, {
      ...this.state.data[index],
      balloonAlias: value,
    });
    this.setState({
      data: newData,
    });
  };

  handleBalloonColorChange = (value, index) => {
    const newData = [...this.state.data];
    newData.splice(index, 1, {
      ...this.state.data[index],
      balloonColor: value,
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
              title: ret.data?.title || '',
              balloonAlias: '',
              balloonColor: '',
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
      type: 'competitions/setCompetitionProblemConfig',
      payload: {
        id,
        data: {
          problems: this.state.data.map((item) => ({
            problemId: item.problemId,
            balloonAlias: item.balloonAlias,
            balloonColor: item.balloonColor,
          })),
        },
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Saved');
        dispatch({
          type: 'competitions/getCompetitionProblemConfig',
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
      type: 'solutions/rejudgeSolution',
      payload: {
        competitionId: id,
        problemId,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Rejudged');
      }
    });
  };

  getCompetitionProblemConfig = (competitionId) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'competitions/getCompetitionProblemConfig',
      payload: {
        id: competitionId,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        return ret.data?.rows || [];
      }
      return [];
    });
  };

  cloneCompetitionProblems = (competitionId) => {
    this.getCompetitionProblemConfig(competitionId).then((ret) => {
      if (ret.length) {
        msg.success('Clone successfully');
        this.setState({
          data: [
            ...this.state.data,
            ...ret
              .filter((r) => !this.state.data.find((p) => p.problemId === r.problemId))
              .map((p) => ({
                problemId: p.problemId,
                title: p.title,
                balloonAlias: '',
                balloonColor: '',
              })),
          ],
        });
      }
    });
  };

  render() {
    const { loading, submitLoading } = this.props;
    const { data } = this.state;
    if (loading) {
      return <PageLoading />;
    }

    return (
      <PageAnimation>
        <h3 className="mb-xl">Problem Settings</h3>
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
                  render={(text, record: IProblemConfig, index) => <span>{record.title}</span>}
                />
                <Table.Column
                  title="Balloon Alias"
                  key="BalloonAlias"
                  render={(text, record: IProblemConfig, index) => (
                    <div>
                      <Input
                        value={record.balloonAlias}
                        onChange={(e) => this.handleBalloonAliasChange(e.target.value, index)}
                        placeholder="e.g., 蓝"
                      />
                    </div>
                  )}
                />
                <Table.Column
                  title="Balloon Color"
                  key="BalloonColor"
                  render={(text, record: IProblemConfig, index) => (
                    <div>
                      <Input
                        value={record.balloonColor}
                        onChange={(e) => this.handleBalloonColorChange(e.target.value, index)}
                        placeholder="e.g., #0099FF"
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
                placeholder="Competition ID"
                buttonText="Clone"
                onAdd={this.cloneCompetitionProblems}
              />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    loading: !!state.loading.effects['competitions/getCompetitionProblemConfig'],
    submitLoading: !!state.loading.effects['competitions/setCompetitionProblemConfig'],
    problems: state.competitions.problemConfig[id],
  };
}

export default connect(mapStateToProps)(CompetitionProblemSettings);
