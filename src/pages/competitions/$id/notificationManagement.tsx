/**
 * title: Notification Management
 */

import React from 'react';
import { connect } from 'dva';
import { Button, Card, Table, Popconfirm, Row, Col } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import { ICompetitionNotification } from '@/common/interfaces/competition';
import PageAnimation from '@/components/PageAnimation';
import GeneralFormModal from '@/components/GeneralFormModal';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ICompetitionSessionStatus;
  list: ICompetitionNotification[];
}

interface State {}

class CompetitionNotificationManagement extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  fetch = async (props?: Props) => {
    const { id, dispatch } = props || this.props;
    return dispatch({
      type: 'competitions/getNotifications',
      payload: {
        id,
        force: true,
      },
    });
  };

  handleDelete = (item: ICompetitionNotification) => {
    this.props
      .dispatch({
        type: 'competitions/deleteCompetitionNotification',
        payload: {
          id: item.competitionId,
          competitionNotificationId: item.competitionNotificationId,
        },
      })
      .then((ret) => {
        msg.auto(ret);
        if (ret.success) {
          msg.success('Delete successfully');
          this.fetch();
        }
      });
  };

  getCreateFormItems = () => {
    return [
      {
        name: 'Content',
        field: 'content',
        component: 'textarea',
        initialValue: '',
      },
    ];
  };

  render() {
    const { id, loading, list } = this.props;
    return (
      <PageAnimation>
        <h3 className="mb-xl">Notification Management</h3>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={list}
                rowKey="competitionNotificationId"
                loading={loading}
                pagination={false}
                className="responsive-table listlike-table"
              >
                <Table.Column
                  title="NID"
                  key="NID"
                  render={(text, record: ICompetitionNotification) => (
                    <span>{record.competitionNotificationId}</span>
                  )}
                />
                <Table.Column
                  title="Question"
                  key="Question"
                  render={(text, record: ICompetitionNotification) => <pre>{record.content}</pre>}
                />
                <Table.Column
                  title="Action"
                  key="Action"
                  render={(text, record: ICompetitionNotification) => (
                    <span>
                      <Popconfirm
                        title="Delete this notification?"
                        placement="left"
                        onConfirm={() => this.handleDelete(record)}
                      >
                        <a>Delete</a>
                      </Popconfirm>
                    </span>
                  )}
                />
              </Table>
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <GeneralFormModal
                loadingEffect="competitions/createCompetitionNotification"
                title="Send Notification to Participants"
                autoMsg
                items={this.getCreateFormItems()}
                submit={(dispatch: ReduxProps['dispatch'], values) => {
                  const data = {
                    content: values.content,
                  };
                  return dispatch({
                    type: 'competitions/createCompetitionNotification',
                    payload: {
                      id,
                      data,
                    },
                  });
                }}
                onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                  msg.success('Add successfully');
                  tracker.event({
                    category: 'competitions',
                    action: 'createNotification',
                  });
                }}
                onSuccessModalClosed={(
                  dispatch: ReduxProps['dispatch'],
                  ret: IApiResponse<any>,
                ) => {
                  this.fetch();
                }}
              >
                <Button block>Send Notification</Button>
              </GeneralFormModal>
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
    session: state.competitions.session[id],
    list: state.competitions.notifications[id]?.rows || [],
    loading: state.loading.effects['competitions/getNotifications'],
  };
}

export default connect(mapStateToProps)(CompetitionNotificationManagement);
