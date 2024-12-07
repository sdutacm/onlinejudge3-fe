import React from 'react';
import { connect } from 'dva';
import { Form, Modal } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import UserSelect from './UserSelect';

export interface Props extends ReduxProps, FormProps {
  invitationCode: string;
  confirmLoading: boolean;
  onAddMember: (userId: number) => Promise<boolean>;
}

interface State {
  visible: boolean;
}

class AddTeamMemberModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleOk = () => {
    const { form } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const users = values.users;
        const userIds = Array.isArray(users) ? users.map((v) => +v.key) : [+users.key];
        this.props.onAddMember(userIds[0]).then((success) => {
          if (success) {
            form.resetFields();
            this.handleHideModel();
          }
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
    const { children, confirmLoading, invitationCode, form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <>
        <span onClick={this.handleShowModel}>{children}</span>
        <Modal
          title="Invite Team Member"
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={confirmLoading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="User">
              {getFieldDecorator('users', {
                rules: [{ required: true, message: 'Please select a user' }],
              })(
                <UserSelect
                  placeholder="Input nickname to search"
                  nameFormat={(u) => `${u.nickname} (UID: ${u.userId})`}
                />,
              )}
            </Form.Item>
          </Form>
          <p className="text-secondary mb-sm">
            After being invited, the user still need to confirm through your code:
          </p>
          <p className="text-center text-bold" style={{ fontSize: '18px' }}>
            {invitationCode}
          </p>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(Form.create()(AddTeamMemberModal));
