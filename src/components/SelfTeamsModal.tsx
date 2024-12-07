import React from 'react';
import { connect } from 'dva';
import { Form, Input, Modal, Table } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import { codeMsgs, Codes } from '@/common/codes';
import TimeBar from './TimeBar';
import UserBar from './UserBar';

export interface Props extends ReduxProps, FormProps {
  userId: number;
  teams: IUserSelfJoinedTeam[];
  confirmJoinLoading: boolean;
}

interface State {
  visible: boolean;
  invitationCode: string;
}

class SelfTeamsModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      invitationCode: '',
    };
  }

  handleConfirmJoinTeam = () => {
    const { dispatch, confirmJoinLoading } = this.props;
    if (confirmJoinLoading) {
      return;
    }
    const { invitationCode } = this.state;
    if (!invitationCode) {
      msg.error('Please input invitation code');
      return;
    }
    if (isNaN(+invitationCode)) {
      msg.error(codeMsgs[Codes.USER_NOT_INVITED_TO_THIS_TEAM]);
      return;
    }
    dispatch({
      type: 'users/confirmJoinTeam',
      payload: {
        teamUserId: +invitationCode || 0,
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Joined successfully');
        // this.handleHideModel();
        this.setState({ invitationCode: '' });
        tracker.event({
          category: 'users',
          action: 'confirmJoinTeam',
        });
        dispatch({
          type: 'users/getSelfJoinedTeams',
        });
      }
    });
  };

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, loading, teams, form } = this.props;

    return (
      <>
        <span onClick={this.handleShowModel}>{children}</span>
        <Modal
          title="My Teams"
          visible={this.state.visible}
          onCancel={this.handleHideModel}
          footer={null}
          maskClosable={false}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Join an Invited Team">
              <Input.Search
                enterButton="Join"
                placeholder="Invitation code"
                className="input-button"
                value={this.state.invitationCode}
                onChange={(e) => this.setState({ invitationCode: e.target.value })}
                onSearch={this.handleConfirmJoinTeam}
              />
            </Form.Item>
          </Form>

          <h4>Joined Teams</h4>
          <Table
            dataSource={teams}
            rowKey="teamUserId"
            loading={loading}
            pagination={false}
            className="responsive-table"
          >
            <Table.Column
              title="Team"
              key="team"
              render={(text, record: IUserSelfJoinedTeam) => (
                <span>
                  {record.nickname}
                  <br />
                  <span className="text-secondary" style={{ fontSize: '12px' }}>Account: {record.username}</span>
                </span>
              )}
            />
            <Table.Column
              title="Members"
              key="members"
              render={(text, record: IUserSelfJoinedTeam) => (
                <span>
                  {record.members.map((member) => (
                    <UserBar key={member.userId} user={member} hideName useTooltip />
                  ))}
                </span>
              )}
            />
            <Table.Column
              title="Joined at"
              key="joinedAt"
              render={(text, record: IUserSelfJoinedTeam) => (
                <span>
                  <TimeBar time={new Date(record.selfJoinedAt).getTime()} />
                </span>
              )}
            />
          </Table>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['users/getSelfJoinedTeams'],
    teams: state.users.selfJoinedTeams,
    confirmJoinLoading: !!state.loading.effects['users/confirmJoinTeam'],
  };
}

export default connect(mapStateToProps)(Form.create()(SelfTeamsModal));
