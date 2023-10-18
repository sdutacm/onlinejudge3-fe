/**
 * title: Balloon
 */

import React from 'react';
import { connect } from 'dva';
import { Button, Tabs, Card, Table, Tag } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import { EBalloonStatus, EBalloonType } from '@/common/enums';
import PageAnimation from '@/components/PageAnimation';
import { IBalloon } from '@/common/interfaces/balloon';
import { numberToAlphabet } from '@/utils/format';
import { formatCompetitionUserSeatId } from '@/utils/competition';
import ReceiveBalloonModal from '@/components/ReceiveBalloonModal';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ICompetitionSessionStatus;
  submitLoading: boolean;
}

interface State {
  currentActiveStatus: EBalloonStatus;
  list: IBalloon[];
}

class CompetitionBalloon extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentActiveStatus: EBalloonStatus.pending,
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
      type: 'competitions/getCompetitionBalloons',
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
    [
      EBalloonStatus.pending,
      EBalloonStatus.doing,
      EBalloonStatus.completed,
      EBalloonStatus.cancelled,
    ].forEach((status) => {
      listGrouped[status] = list.filter((item) => item.status === status);
    });
    return listGrouped;
  };

  handleChangeStatus = (balloon: IBalloon, status: EBalloonStatus) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'competitions/updateCompetitionBalloonStatus',
      payload: {
        id: balloon.competitionId,
        balloonId: balloon.balloonId,
        data: { status },
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Operate successfully');
        this.fetch();
      }
    });
  };

  render() {
    const { id, loading } = this.props;
    const { currentActiveStatus } = this.state;
    const listGrouped = this.getListGroupedByStatus();
    return (
      <PageAnimation>
        <div className="full-width-inner-content">
          <h3 className="mb-xl">Balloon Dashboard</h3>
          <div>
            <Tabs
              activeKey={`${currentActiveStatus}`}
              onChange={(key) => this.switchTab(+key)}
              tabBarExtraContent={
                <Button
                  size="small"
                  shape="circle"
                  icon="reload"
                  onClick={() => this.fetch()}
                ></Button>
              }
            >
              <Tabs.TabPane
                tab={
                  <span>
                    Pending{' '}
                    <Tag className="ml-md">{listGrouped[EBalloonStatus.pending].length}</Tag>
                  </span>
                }
                key={`${EBalloonStatus.pending}`}
              />
              <Tabs.TabPane
                tab={
                  <span>
                    Doing <Tag className="ml-md">{listGrouped[EBalloonStatus.doing].length}</Tag>
                  </span>
                }
                key={`${EBalloonStatus.doing}`}
              />
              <Tabs.TabPane
                tab={
                  <span>
                    Completed{' '}
                    <Tag className="ml-md">{listGrouped[EBalloonStatus.completed].length}</Tag>
                  </span>
                }
                key={`${EBalloonStatus.completed}`}
              />
              <Tabs.TabPane
                tab={
                  <span>
                    Cancelled{' '}
                    <Tag className="ml-md">{listGrouped[EBalloonStatus.cancelled].length}</Tag>
                  </span>
                }
                key={`${EBalloonStatus.cancelled}`}
              />
            </Tabs>
          </div>
          <div>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={listGrouped[currentActiveStatus]}
                rowKey="balloonId"
                loading={loading}
                pagination={false}
                className="responsive-table listlike-table"
              >
                <Table.Column
                  title="Balloon ID"
                  key="Balloon ID"
                  render={(text, record: IBalloon) => <span>{record.balloonId}</span>}
                />
                <Table.Column
                  title="Type"
                  key="Type"
                  render={(text, record: IBalloon) =>
                    record.type === EBalloonType.recall ? (
                      <span className="text-danger">Recall</span>
                    ) : (
                      <span>Delivery</span>
                    )
                  }
                />
                <Table.Column
                  title="Problem"
                  key="Problem"
                  render={(text, record: IBalloon) => (
                    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <span className="text-bold">{numberToAlphabet(record.problemIndex)}</span>
                      {!!record.balloonColor && (
                        <span
                          className="ml-lg"
                          style={{
                            display: 'inline-block',
                            borderRadius: '100%',
                            width: '20px',
                            height: '20px',
                            background: record.balloonColor,
                          }}
                        ></span>
                      )}
                      {!!record.balloonAlias && (
                        <span className="ml-sm">{record.balloonAlias}</span>
                      )}
                      {record.isFb && <span className="ml-sm text-success">(FB)</span>}
                    </div>
                  )}
                />
                <Table.Column
                  title="Seat ID"
                  key="SeatID"
                  render={(text, record: IBalloon) => (
                    <span>{formatCompetitionUserSeatId(record)}</span>
                  )}
                />
                <Table.Column
                  title="Participant"
                  key="Participant"
                  render={(text, record: IBalloon) => (
                    <span>{record.subname || record.nickname}</span>
                  )}
                />
                <Table.Column
                  title="Action"
                  key="Action"
                  render={(text, record: IBalloon) => (
                    <span>
                      {record.status === EBalloonStatus.pending && (
                        <ReceiveBalloonModal data={record} onReceive={this.fetch}>
                          <span>Receive</span>
                        </ReceiveBalloonModal>
                      )}
                      {record.status === EBalloonStatus.doing && (
                        <span>
                          <a
                            onClick={() =>
                              this.handleChangeStatus(record, EBalloonStatus.completed)
                            }
                          >
                            Complete
                          </a>
                          <a
                            className="ml-md-lg"
                            onClick={() =>
                              this.handleChangeStatus(record, EBalloonStatus.cancelled)
                            }
                          >
                            Cancel
                          </a>
                        </span>
                      )}
                    </span>
                  )}
                />
              </Table>
            </Card>
          </div>
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
    loading: !!state.loading.effects['competitions/getCompetitionBalloons'],
    submitLoading: !!state.loading.effects['competitions/updateCompetitionBalloonStatus'],
  };
}

export default connect(mapStateToProps)(CompetitionBalloon);
