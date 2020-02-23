import React from 'react';
import { connect } from 'dva';
import { Form, Modal } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import UserSelect from './UserSelect';

export interface Props extends ReduxProps, FormProps {
  groupId: number;
}

interface State {
  visible: boolean;
}

class AddGroupMemberModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleOk = () => {
    const { dispatch, groupId, form } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const userIds = values.users.map((v) => +v.key);
        dispatch({
          type: 'groups/addGroupMember',
          payload: {
            id: groupId,
            data: { userIds },
          },
        }).then((ret) => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Added successfully');
            form.resetFields();
            this.handleHideModel();
            tracker.event({
              category: 'groups',
              action: 'addGroupMember',
            });
            this.props.dispatch({
              type: 'groups/getMembers',
              payload: {
                id: groupId,
                force: true,
              },
            });
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
    const { children, loading, form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <>
        <span onClick={this.handleShowModel}>{children}</span>
        <Modal
          title="Add Members"
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Users">
              {getFieldDecorator('users', {
                rules: [{ required: true, message: 'Please select at least one user' }],
              })(<UserSelect multiple />)}
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['groups/addGroupMember'],
  };
}

export default connect(mapStateToProps)(Form.create()(AddGroupMemberModal));
