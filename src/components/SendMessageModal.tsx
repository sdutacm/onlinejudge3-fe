import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal, Checkbox } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';

interface Props extends ReduxProps, RouteProps, FormProps {
  session: ISessionStatus;
  toUserId: number;
}

interface State {
  visible: boolean;
}

class SendMessageModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleOk = () => {
    const { dispatch, toUserId, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'messages/send',
          payload: {
            ...values,
            toUserId,
          },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Send successfully');
            this.handleHideModel();
            form.resetFields();
          }
        });
      }
    });
  };

  handleShowModel = e => {
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
      <span onClick={e => e.stopPropagation()}>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Send Message"
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
          zIndex={1031}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Title">
              {getFieldDecorator('title', {
                rules: [{ required: true, message: 'Please input title' }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Content">
              {getFieldDecorator('content', {
                rules: [{ required: true, message: 'Please input content' }],
              })(<Input.TextArea rows={8} />)}
            </Form.Item>

            <Form.Item>
              {getFieldDecorator('anonymous', {
                valuePropName: 'checked',
                initialValue: false,
              })(<Checkbox>Anonymous</Checkbox>)}
            </Form.Item>
          </Form>
        </Modal>
      </span>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
    loading: !!state.loading.effects['messages/send'],
  };
}

export default connect(mapStateToProps)(Form.create()(SendMessageModal));
