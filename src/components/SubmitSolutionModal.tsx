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
import tracker from '@/utils/tracker';
import { encode } from 'js-base64';

export interface Props extends ReduxProps, FormProps {
  problemId: number;
  problemIndex?: number;
  contestId?: number;
  competitionId?: number;
  title: string;
  languageConfig: IJudgerLanguageConfigItem[];
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

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'solutions/getLanguageConfig',
      payload: {},
    });
  }

  handleOk = () => {
    const { dispatch, contestId, competitionId, location } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'solutions/submit',
          payload: {
            ...values,
            codeFormat: 'base64',
            code: encode(values.code),
            contestId,
            competitionId,
          },
        }).then((ret) => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Submit successfully');
            this.handleHideModel();
            tracker.event({
              category: 'solutions',
              action: 'submit',
              label: values.language,
            });
            const solutionId = ret.data.solutionId;
            // @ts-ignore
            window._sockets.judger.emit('subscribe', [solutionId]);
            console.log('subscribe', [solutionId]);
            const url = contestId
              ? urlf(pages.contests.solutionDetail, {
                  param: { id: contestId, sid: solutionId },
                })
              : competitionId
              ? urlf(pages.competitions.solutionDetail, {
                  param: { id: competitionId, sid: solutionId },
                })
              : urlf(pages.solutions.detail, {
                  param: { id: solutionId },
                  query: { from: location.query.from },
                });
            setTimeout(() => router.push(url), constants.modalAnimationDurationFade);
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
    const { children, loading, form, problemId, problemIndex, title, languageConfig } = this.props;
    const { getFieldDecorator } = form;
    const selectedLanguage = form.getFieldValue('language');
    const selectedLanguageConfig = languageConfig.find(
      (lang) => lang.language === selectedLanguage,
    );

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
              {getFieldDecorator('problemId', { initialValue: problemId })(
                <span className="ant-form-text">
                  {problemIndex ? numberToAlphabet(problemIndex) : problemId} - {title}
                </span>,
              )}
            </Form.Item>

            <Form.Item label="Language">
              {getFieldDecorator('language', {
                rules: [{ required: true, message: 'Please select language' }],
                initialValue: 'C++', // TODO 判断用户默认语言设置
              })(
                <Select placeholder="Select a language">
                  {languageConfig.map((lang) => (
                    <Select.Option key={lang.language}>{lang.language}</Select.Option>
                  ))}
                </Select>,
              )}
              <p className="mt-md">{selectedLanguageConfig?.version}</p>
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
    languageConfig: state.solutions.languageConfig,
  };
}

export default connect(mapStateToProps)(Form.create()(SubmitSolutionModal));
