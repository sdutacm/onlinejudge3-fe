import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal } from 'antd';
import numberToAlphabet from '../utils/numberToAlphabet';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import langs from '@/configs/solutionLanguages';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import router from 'umi/router';
import pages from '@/configs/pages';
import urlf from '@/utils/urlf';

interface Props extends ReduxProps, RouteProps, FormProps {
  problemId: number;
  problemIndex?: number;
  contestId?: number;
  title: string;
}

interface State {
  visible: boolean;
}

class SubmitSolutionModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleOk = () => {
    this.props.form.setFieldsValue({
      problemId: this.props.problemId,
    });
    const { dispatch, contestId } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'solutions/submit',
          payload: { ...values, contestId, },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Submit successfully');
            this.handleHideModel();
            setTimeout(() => router.push(urlf(pages.solutions.one, { param: { id: ret.data.solutionId } })),
              constants.modalAnimationDurationFade
            );
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
    const { children, loading, form, problemId, problemIndex, title } = this.props;
    const { getFieldDecorator } = form;

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Submit a Solution"
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Problem">
              {getFieldDecorator('problemId')(<span
                className="ant-form-text">{problemIndex ? numberToAlphabet(problemIndex - 1) : problemId} - {title}</span>)}
            </Form.Item>

            <Form.Item label="Language">
              {getFieldDecorator('language', {
                rules: [{ required: true, message: 'Please select language' }],
              })(
                <Select placeholder="Select a language">
                  {langs.map(lang => (<Select.Option key={lang.fieldName}>{lang.displayFullName}</Select.Option>))}
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Code">
              {getFieldDecorator('code', {
                rules: [{ required: true, message: 'Please input code' }],
              })(<Input.TextArea rows={8} />)}
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['solutions/submit'],
  };
}

export default connect(mapStateToProps)(Form.create()(SubmitSolutionModal));
