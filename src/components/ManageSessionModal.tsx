import React from 'react';
import { connect } from 'dva';
import { Modal, Table } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import TimeBar from './TimeBar';
import Bowser from 'bowser';

export interface Props extends ReduxProps, RouteProps {
  userId: number;
  loadings: Record<string, boolean>;
  sessionList: ISessionListItem[];
}

interface State {
  visible: boolean;
}

class ManageSessionModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  clearSession = (sessionId: string) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'session/clearSession',
      payload: {
        sessionId,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Clear session successfully');
        dispatch({
          type: 'session/getSessionList',
          payload: {},
        });
      }
    });
    tracker.event({
      category: 'users',
      action: 'clearSession',
    });
  };

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.props.dispatch({
      type: 'session/getSessionList',
      payload: {},
    });
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, loadings, sessionList } = this.props;

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Manage Session"
          visible={this.state.visible}
          onCancel={this.handleHideModel}
          footer={null}
          width={680}
        >
          <Table
            dataSource={sessionList}
            rowKey="sessionId"
            loading={loadings.getSessionList}
            pagination={false}
            className="responsive-table"
          >
            <Table.Column
              title="Login Device"
              key="loginUa"
              render={(text, record: ISessionListItem) => {
                if (!record.loginUa) {
                  return null;
                }
                const res = Bowser.parse(record.loginUa);
                return (
                  <span>
                    {res.browser.name} {res.browser.version} on {res.os.name} {res.os.version}
                    {record.isCurrent ? (
                      <>
                        <br />
                        <span className="text-success">(Current Session)</span>
                      </>
                    ) : null}
                  </span>
                );
              }}
            />
            <Table.Column
              title="Login at"
              key="loginIp"
              render={(text, record: ISessionListItem) => (
                <span>
                  {record.loginIp}
                  <br />
                  <TimeBar time={new Date(record.loginAt).getTime()} />
                </span>
              )}
            />
            <Table.Column
              title="Last Access at"
              key="lastAccessIp"
              render={(text, record: ISessionListItem) => (
                <span>
                  {record.lastAccessIp}
                  <br />
                  <TimeBar time={new Date(record.lastAccessAt).getTime()} />
                </span>
              )}
            />
            <Table.Column
              title="Actions"
              key="Actions"
              render={(text, record: ISessionListItem) =>
                record.isCurrent ? null : (
                  <a onClick={() => this.clearSession(record.sessionId)}>Clear</a>
                )
              }
            />
          </Table>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loadings: {
      clearSession: !!state.loading.effects['session/clearSession'],
      getSessionList: state.loading.effects['session/getSessionList'],
    },
    sessionList: state.session.sessionList.rows || [],
  };
}

export default connect(mapStateToProps)(ManageSessionModal);
