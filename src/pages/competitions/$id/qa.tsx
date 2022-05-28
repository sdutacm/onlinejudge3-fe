/**
 * title: QA
 */

import React from 'react';
import { connect } from 'dva';
import { Button, Card, Table, Popconfirm, Row, Col, Tabs } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import { ICompetitionQuestion } from '@/common/interfaces/competition';
import PageAnimation from '@/components/PageAnimation';
import GeneralFormModal from '@/components/GeneralFormModal';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ICompetitionSessionStatus;
}

interface State {
  currentActiveStatus: number;
  list: ICompetitionQuestion[];
}

class CompetitionQuestionManagement extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentActiveStatus: 0,
      list: [],
    };
  }

  componentDidMount(): void {
    this.fetch(this.props);
  }

  componentWillReceiveProps(np: Props) {
    if (this.props.id !== np.id && np.id) {
      this.fetch(np);
    }
  }

  fetch = async (props?: Props) => {
    const { id, dispatch } = props || this.props;
    const res = await dispatch({
      type: 'competitions/getAllQuestions',
      payload: {
        id,
      },
    });
    if (res.success) {
      this.setState({
        list: res.data.rows,
      });
    }
  };

  switchTab = (status) => {
    this.setState({
      currentActiveStatus: status,
    });
    this.fetch(this.props);
  };

  getListGroupedByStatus = () => {
    const { list } = this.state;
    const listGrouped = {};
    [0, 1].forEach((status) => {
      listGrouped[status] = list.filter((item) => item.status === status);
    });
    return listGrouped;
  };

  getReplyFormItems = () => {
    return [
      {
        name: 'Reply',
        field: 'reply',
        component: 'textarea',
        initialValue: '',
      },
    ];
  };

  render() {
    const { id, loading } = this.props;
    const { list } = this.state;
    return (
      <PageAnimation>
        <h3 className="mb-xl">Q&amp;A</h3>
        <div>
          <Card bordered={false} className="list-card">
            <Table
              dataSource={list}
              rowKey="competitionQuestionId"
              loading={loading}
              pagination={false}
              className="responsive-table listlike-table"
            >
              <Table.Column
                title="QID"
                key="QID"
                render={(text, record: ICompetitionQuestion) => (
                  <span>{record.competitionQuestionId}</span>
                )}
              />
              <Table.Column
                title="Question"
                key="Question"
                render={(text, record: ICompetitionQuestion) => <pre>{record.content}</pre>}
              />
              <Table.Column
                title="Reply"
                key="Reply"
                render={(text, record: ICompetitionQuestion) => <pre>{record.reply}</pre>}
              />
              <Table.Column
                title="Action"
                key="Action"
                render={(text, record: ICompetitionQuestion) => (
                  <span>
                    {!record.reply && (
                      <GeneralFormModal
                        loadingEffect="competitions/replyCompetitionQuestion"
                        title="Reply Question"
                        autoMsg
                        items={this.getReplyFormItems()}
                        submit={(dispatch: ReduxProps['dispatch'], values) => {
                          return dispatch({
                            type: 'competitions/replyCompetitionQuestion',
                            payload: {
                              id: record.competitionId,
                              competitionQuestionId: record.competitionQuestionId,
                              data: {
                                reply: values.reply,
                              },
                            },
                          });
                        }}
                        onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                          msg.success('Reply successfully');
                          tracker.event({
                            category: 'competitions',
                            action: 'replyQuestion',
                          });
                        }}
                        onSuccessModalClosed={(
                          dispatch: ReduxProps['dispatch'],
                          ret: IApiResponse<any>,
                        ) => {
                          this.fetch();
                        }}
                      >
                        <a className="ml-md-lg">Reply</a>
                      </GeneralFormModal>
                    )}
                  </span>
                )}
              />
            </Table>
          </Card>
        </div>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    session: state.competitions.session[id],
    loading: state.loading.effects['competitions/getAllQuestions'],
  };
}

export default connect(mapStateToProps)(CompetitionQuestionManagement);
