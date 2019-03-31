import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import OJBK from '@/utils/OJBK';
import setStatePromise from '@/utils/setStatePromise';
import router from 'umi/router';
import pages from '@/configs/pages';

interface Props extends FormProps, ReduxProps {
}

interface State {
  loading: boolean;
}

class OJBKPre extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};
  setStatePromise = setStatePromise.bind(this);

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.handleOJBK(values.OJBK);
      }
    });
  };

  handleOJBK = async (k) => {
    await this.setStatePromise({ loading: true });
    OJBK.setOJBK(k);
    const ret = await OJBK.checkOJBK();
    await this.setStatePromise({ loading: false });
    if (ret) {
      msg.success('Welcome to OJ Pre-Beta World');
      router.push(pages.index);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    else {
      msg.error('Invalid OJBK');
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="content-view-xs center-view">
        <h2 className="text-center" style={{ marginBottom: '45px' }}>Require OJ Beta Key to access</h2>
        <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
          <Form.Item label="OJBK (OJ Beta Key)">
            {getFieldDecorator('OJBK', {
              rules: [{ required: true, message: 'Please input OJBK' }],
            })(<Input />)}
          </Form.Item>

          <Form.Item>
            <Button type="primary" block htmlType="submit" loading={this.state.loading}>Submit</Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default connect()(Form.create()(OJBKPre));
