/**
 * title: Competition Problem Settings
 */

import React from 'react';
import { connect } from 'dva';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { getPathParamId } from '@/utils/getPathParams';
import { Button, Form, Row, Col, Card, Table, Input, Icon, Tag } from 'antd';
import msg from '@/utils/msg';
import PageLoading from '@/components/PageLoading';
import { isEqual, noop } from 'lodash-es';
import { numberToAlphabet } from '@/utils/format';
import AddItemByIdCard from '@/components/AddItemByIdCard';
import classNames from 'classnames';
import Explanation from '@/components/Explanation';
import CopyToClipboardWrapper from '@/components/CopyToClipboardWrapper';

interface IProblemConfig {
  problemId: number;
  alias: string;
  balloonAlias: string;
  balloonColor: string;
  title: string;
  score: string;
  varScoreExpression: string;
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

  handleAliasChange = (value, index) => {
    const newData = [...this.state.data];
    newData.splice(index, 1, {
      ...this.state.data[index],
      alias: value,
    });
    this.setState({
      data: newData,
    });
  };

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

  handleScoreChange = (value, index) => {
    const newData = [...this.state.data];
    newData.splice(index, 1, {
      ...this.state.data[index],
      score: value,
    });
    this.setState({
      data: newData,
    });
  };

  handlevarScoreExpressionChange = (value, index) => {
    const newData = [...this.state.data];
    newData.splice(index, 1, {
      ...this.state.data[index],
      varScoreExpression: value,
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
              alias: '',
              balloonAlias: '',
              balloonColor: '',
              score: '',
              varScoreExpression: '',
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
            alias: item.alias || '',
            balloonAlias: item.balloonAlias || '',
            balloonColor: item.balloonColor || '',
            score: item.score === '' ? null : +item.score || 0,
            varScoreExpression: item.varScoreExpression || '',
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
                alias: '',
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
        <div className="full-width-inner-content">
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
                    key="Index"
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
                    title="Alias"
                    key="Alias"
                    width={75}
                    render={(text, record: IProblemConfig, index) => (
                      <div>
                        <Input
                          value={record.alias}
                          onChange={(e) => this.handleAliasChange(e.target.value, index)}
                        />
                      </div>
                    )}
                  />
                  <Table.Column
                    title="Balloon Alias"
                    key="BalloonAlias"
                    width={140}
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
                    width={140}
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
                    title={
                      <span>
                        Score (for specific rules which contain score support)
                        <Explanation className="ml-sm-md">
                          You can configure score to customize problem-level score.
                          <br />
                          If you need a dynamic score algorithm, set "Variable Score Expression",
                          which is a JavaScript expression.
                          <br />
                          The following variable placeholders are available:
                          <ul>
                            <li>
                              <CopyToClipboardWrapper text="$score">
                                <Tag>$score</Tag>
                              </CopyToClipboardWrapper>
                              : The configured score of current problem
                            </li>
                            <li>
                              <CopyToClipboardWrapper text="$problemIndex">
                                <Tag>$problemIndex</Tag>
                              </CopyToClipboardWrapper>
                              : The index of current problem
                            </li>
                            <li>
                              <CopyToClipboardWrapper text="$elapsedTime.h">
                                <Tag>$elapsedTime.h</Tag>
                              </CopyToClipboardWrapper>
                              : The elapsed time (converted to hour unit, rounded down)
                            </li>
                            <li>
                              <CopyToClipboardWrapper text="$elapsedTime.min">
                                <Tag>$elapsedTime.min</Tag>
                              </CopyToClipboardWrapper>
                              : The elapsed time (converted to minute unit, rounded down)
                            </li>
                            <li>
                              <CopyToClipboardWrapper text="$elapsedTime.s">
                                <Tag>$elapsedTime.s</Tag>
                              </CopyToClipboardWrapper>
                              : The elapsed time (converted to second unit, rounded down)
                            </li>
                            <li>
                              <CopyToClipboardWrapper text="$tries">
                                <Tag>$tries</Tag>
                              </CopyToClipboardWrapper>
                              : The number of tries before the user first AC
                            </li>
                          </ul>
                        </Explanation>
                      </span>
                    }
                    key="Score"
                    render={(text, record: IProblemConfig, index) => (
                      <div>
                        <div>
                          <Input
                            value={record.score}
                            onChange={(e) => this.handleScoreChange(e.target.value, index)}
                            placeholder="Score"
                          />
                        </div>
                        <div className="mt-sm">
                          <Input.TextArea
                            value={record.varScoreExpression}
                            onChange={(e) =>
                              this.handlevarScoreExpressionChange(e.target.value, index)
                            }
                            placeholder="Variable Score Expression"
                          />
                        </div>
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
                            index === data.length - 1
                              ? noop
                              : () => this.handleMove(index, index + 1)
                          }
                        >
                          <Icon type="down" />
                        </a>
                        <a
                          className="ml-md-lg"
                          onClick={() => this.handleRejudge(record.problemId)}
                        >
                          Rejudge
                        </a>
                        <a
                          className="ml-md-lg text-danger"
                          onClick={() => this.handleDelete(index)}
                        >
                          Del
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
        </div>
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
