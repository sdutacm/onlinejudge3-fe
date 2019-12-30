import React from 'react';
import { connect } from 'dva';
import { Form, Input, Modal } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';
import { Codes } from '@/configs/codes/codes';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps, RouteProps, FormProps {
  type: 'bind' | 'change';
  userId: number;
  loadings: Record<string, boolean>;
}

interface State {
  visible: boolean;
  verificationCodeRetry: number | null;
  verificationCodeRetryTimer: number | null;
}

class ChangeEmailModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      verificationCodeRetry: null,
      verificationCodeRetryTimer: null,
    };
  }

  getVerificationCode = () => {
    const { dispatch, form } = this.props;
    form.validateFields(['email']);
    if (!form.getFieldError('email')) {
      dispatch({
        type: 'verifications/getCode',
        payload: form.getFieldsValue(['email']),
      }).then(ret => {
        if (ret.success || ret.code === Codes.R_VERIFICATIONS_FLE) {
          msg.success('The verifications code has been sent to your email');
          const { retryAfter } = ret.data;
          this.setState({ verificationCodeRetry: Math.ceil(retryAfter) });
          const timer = setInterval(function () {
            this.setState(prevState => {
              if (prevState.verificationCodeRetry <= 1) {
                clearInterval(prevState.verificationCodeRetryTimer);
                return { verificationCodeRetry: null };
              }
              return { verificationCodeRetry: prevState.verificationCodeRetry - 1 };
            });
          }.bind(this), 1000);
          // @ts-ignore
          this.setState({ verificationCodeRetryTimer: timer });
        } else {
          msg.auto(ret);
        }
      });
    }
  };

  handleOk = () => {
    const { dispatch, userId, type } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'users/changeEmail',
          payload: {
            userId,
            data: {
              ...values,
              code: +values.code,
            },
          },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            msg.success(type === 'bind' ? 'Bind email successfully' : 'Change email successfully');
            this.handleHideModel();
            dispatch({
              type: 'users/getDetail',
              payload: {
                id: userId,
                force: true,
              },
            });
          }
        });
        tracker.event({
          category: 'users',
          action: type === 'bind' ? 'bindEmail' : 'changeEmail',
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
    const { children, loadings, form, type } = this.props;
    const { getFieldDecorator } = form;
    const verificationCodeRetry = this.state.verificationCodeRetry;

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title={type === 'bind' ? 'Bind Email' : 'Change Email'}
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loadings.changeEmail}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Email">
              {getFieldDecorator('email', {
                rules: [{
                  type: 'email', message: 'Please input a valid email',
                }, {
                  required: true, message: 'Please input email',
                }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Verification Code">
              {getFieldDecorator('code', {
                rules: [{ required: true, message: 'Please input verification code' }],
              })(
                <Input.Search
                  enterButton={verificationCodeRetry ? `Resend code (${verificationCodeRetry}s)` : 'Send code'}
                  className={verificationCodeRetry || loadings.verificationCode ? 'input-button-disabled' : 'input-button'}
                  onSearch={() => !(verificationCodeRetry || loadings.verificationCode) && this.getVerificationCode()}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loadings: {
      verificationCode: !!state.loading.effects['verifications/getCode'],
      changeEmail: !!state.loading.effects['users/changeEmail'],
    },
  };
}

export default connect(mapStateToProps)(Form.create()(ChangeEmailModal));
