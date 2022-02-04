import React from 'react';
import { Form, Modal } from 'antd';
import { FormProps } from '@/@types/props';
import UserSelect from './UserSelect';

export interface Props extends FormProps {
  title: string;
  multiple: boolean;
  onAdd(userIdResult: number | number[]): void | Promise<void>;
}

interface State {
  visible: boolean;
}

class AddUserModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleOk = () => {
    const { onAdd, form } = this.props;
    form.validateFields(async (err, values) => {
      if (!err) {
        console.log('values', values)
        let res: number | number[];
        if (Array.isArray(values.users)) {
          res = values.users.map((v) => v.value);
        } else {
          res = values.users.value;
        }
        await onAdd(res);
        form.resetFields();
        this.handleHideModel();
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
    const { children, form, title, multiple } = this.props;
    const { getFieldDecorator } = form;

    return (
      <>
        <span onClick={this.handleShowModel}>{children}</span>
        <Modal
          title={title}
          visible={this.state.visible}
          okText="Submit"
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label={multiple ? 'Users' : 'User'}>
              {getFieldDecorator('users', {
                rules: [{ required: true, message: 'Please select user' }],
              })(<UserSelect multiple={multiple} placeholder="Input nickname to search" />)}
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

export default Form.create()(AddUserModal);
