import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal } from 'antd';
import { FormProps, ReduxProps, RouteLocation } from '@/@types/props';
import langs from '@/configs/solutionLanguages';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import router from 'umi/router';
import pages from '@/configs/pages';
import { numberToAlphabet, urlf } from '@/utils/format';

export interface Props extends ReduxProps, FormProps {
  problemId: number;
  problemIndex?: number;
  contestId?: number;
  title: string;
  location?: RouteLocation;
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
    const { dispatch, contestId, location } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'solutions/submit',
          payload: { ...values, contestId },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Submit successfully');
            this.handleHideModel();
            const url = contestId
              ? urlf(pages.contests.solutionDetail, { param: { id: contestId, sid: ret.data.solutionId } })
              : urlf(pages.solutions.detail, { param: { id: ret.data.solutionId }, query: { from: location.query.from } });
            setTimeout(() => router.push(url),
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
              {getFieldDecorator('problemId', { initialValue: problemId })(<span
                className="ant-form-text">{problemIndex ? numberToAlphabet(problemIndex) : problemId} - {title}</span>)}
            </Form.Item>

            <Form.Item label="Language">
              {getFieldDecorator('language', {
                rules: [{ required: true, message: 'Please select language' }],
                initialValue: 'g++', // TODO 判断用户默认语言设置
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
