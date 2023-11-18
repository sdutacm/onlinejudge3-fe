import React from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Button, Alert, Badge } from 'antd';
import classNames from 'classnames';
import setStatePromise from '@/utils/setStatePromise';
import msg from '@/utils/msg';
import setFormErrors from '@/utils/setFormErrors';
import constants from '@/configs/constants';
import styles from './JoinModal.less';
import gStyles from '../../general.less';
import 'csshake';
import { Codes } from '@/common/codes';
import tracker from '@/utils/tracker';
import WeakPasswordChecker from '@/common/utils/weakpwd-check';

class JoinModal extends React.Component<any, any> {
  private setStatePromise = setStatePromise.bind(this);
  private tabs = {
    login: {
      title: 'Login',
      body: () => {
        const { getFieldDecorator } = this.props.form;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item label="Email or Username">
              {getFieldDecorator('loginName', {
                rules: [
                  {
                    required: true,
                    message: 'Please input email or username',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Password">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input password' }],
              })(<Input type="password" />)}
            </Form.Item>

            <Form.Item>
              <a onClick={(e) => this.switchTab(e, 'forgotPassword')}>Forgot Password</a> or{' '}
              <a onClick={(e) => this.switchTab(e, 'register')}>Register</a>
            </Form.Item>

            <Form.Item className="display-none">
              <Button htmlType="submit" />
            </Form.Item>
          </Form>
        );
      },
    },
    register: {
      title: 'Register',
      body: () => {
        const loading = this.props.loading;
        const { getFieldDecorator } = this.props.form;
        const verificationCodeRetry = this.state.verificationCodeRetry;
        const passwordStatus = this.state.passwordStatus;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item label="Email">
              {getFieldDecorator('email', {
                rules: [
                  {
                    type: 'email',
                    message: 'Please input a valid email',
                  },
                  {
                    required: true,
                    message: 'Please input email',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Verification Code">
              {getFieldDecorator('code', {
                rules: [{ required: true, message: 'Please input verification code' }],
              })(
                <Input.Search
                  enterButton={
                    verificationCodeRetry ? `Resend code (${verificationCodeRetry}s)` : 'Send code'
                  }
                  className={
                    verificationCodeRetry || loading.verificationCode
                      ? 'input-button-disabled'
                      : 'input-button'
                  }
                  onSearch={() =>
                    !(verificationCodeRetry || loading.verificationCode) &&
                    this.getVerificationCode()
                  }
                />,
              )}
            </Form.Item>

            <Form.Item label="Password">
              {getFieldDecorator('password', {
                rules: [
                  {
                    validator: this.validateToNextPassword,
                  },
                  {
                    validator: this.validatePassword,
                  },
                ],
              })(<Input type="password" />)}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Badge
                  status={passwordStatus.verifyLength}
                  text="at least 6 characters"
                />
                <Badge
                  status={passwordStatus.verifyNumberAndLetter}
                  text="contains both letters and numbers"
                />
                <Badge
                  status={passwordStatus.verifyCommonPassword}
                  text="no common weak password"
                />
              </div>
            </Form.Item>

            <Form.Item label="Confirm Password">
              {getFieldDecorator('confirm', {
                rules: [
                  {
                    required: true,
                    message: 'Please confirm password',
                  },
                  {
                    validator: this.compareToFirstPassword,
                  },
                ],
              })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
            </Form.Item>

            <Form.Item label="Username">
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: 'Please input username',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Nickname">
              {getFieldDecorator('nickname', {
                rules: [
                  {
                    required: true,
                    message: 'Please input nickname',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item>
              Already have an account? <a onClick={(e) => this.switchTab(e, 'login')}>Login</a>
            </Form.Item>

            <Form.Item className="display-none">
              <Button htmlType="submit" />
            </Form.Item>
          </Form>
        );
      },
    },
    forgotPassword: {
      title: 'Forgot Password',
      body: () => {
        const loading = this.props.loading;
        const { getFieldDecorator } = this.props.form;
        const verificationCodeRetry = this.state.verificationCodeRetry;
        const passwordStatus = this.state.passwordStatus;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item label="Email">
              {getFieldDecorator('email', {
                rules: [
                  {
                    type: 'email',
                    message: 'Please input a valid email',
                  },
                  {
                    required: true,
                    message: 'Please input email',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Verification Code">
              {getFieldDecorator('code', {
                rules: [{ required: true, message: 'Please input verification code' }],
              })(
                <Input.Search
                  enterButton={
                    verificationCodeRetry ? `Resend code (${verificationCodeRetry}s)` : 'Send code'
                  }
                  className={
                    verificationCodeRetry || loading.verificationCode
                      ? 'input-button-disabled'
                      : 'input-button'
                  }
                  onSearch={() =>
                    !(verificationCodeRetry || loading.verificationCode) &&
                    this.getVerificationCode()
                  }
                />,
              )}
            </Form.Item>

            <Form.Item label="Password">
              {getFieldDecorator('password', {
                rules: [
                  {
                    validator: this.validateToNextPassword,
                  },
                  {
                    validator: this.validatePassword,
                  }
                ],
              })(<Input type="password" />)}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Badge
                  status={passwordStatus.verifyLength}
                  text="at least 6 characters"
                />
                <Badge
                  status={passwordStatus.verifyNumberAndLetter}
                  text="contains both letters and numbers"
                />
                <Badge
                  status={passwordStatus.verifyCommonPassword}
                  text="no common weak password"
                />
              </div>
            </Form.Item>

            <Form.Item label="Confirm Password">
              {getFieldDecorator('confirm', {
                rules: [
                  {
                    required: true,
                    message: 'Please confirm password',
                  },
                  {
                    validator: this.compareToFirstPassword,
                  },
                ],
              })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
            </Form.Item>

            <Form.Item>
              Back to <a onClick={(e) => this.switchTab(e, 'login')}>Login</a>
            </Form.Item>

            <Form.Item className="display-none">
              <Button htmlType="submit" />
            </Form.Item>
          </Form>
        );
      },
    },
    resetPasswordAndEmail: {
      title: 'Need Reset Password',
      body: () => {
        const loading = this.props.loading;
        const { getFieldDecorator } = this.props.form;
        const verificationCodeRetry = this.state.verificationCodeRetry;
        const passwordStatus = this.state.passwordStatus;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item>
              <Alert
                message="Your password strength is too low. You need to bind your email and change it to a strong password to log in"
                type="warning"
                showIcon
              />
            </Form.Item>

            <Form.Item label="Username">
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: 'Please input username',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Old Password">
              {getFieldDecorator('oldPassword', {
                rules: [
                  {
                    required: true,
                    message: 'Please input old password',
                  },
                ],
              })(<Input type="password" />)}
            </Form.Item>

            <Form.Item label="Email">
              {getFieldDecorator('email', {
                rules: [
                  {
                    type: 'email',
                    message: 'Please input a valid email',
                  },
                  {
                    required: true,
                    message: 'Please input email',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Verification Code">
              {getFieldDecorator('code', {
                rules: [{ required: true, message: 'Please input verification code' }],
              })(
                <Input.Search
                  enterButton={
                    verificationCodeRetry ? `Resend code (${verificationCodeRetry}s)` : 'Send code'
                  }
                  className={
                    verificationCodeRetry || loading.verificationCode
                      ? 'input-button-disabled'
                      : 'input-button'
                  }
                  onSearch={() =>
                    !(verificationCodeRetry || loading.verificationCode) &&
                    this.getVerificationCode()
                  }
                />,
              )}
            </Form.Item>

            <Form.Item label="New Password">
              {getFieldDecorator('password', {
                rules: [
                  {
                    validator: this.validateToNextPassword,
                  },
                  {
                    validator: this.validatePassword,
                  },
                ],
              })(<Input type="password" />)}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Badge
                  status={passwordStatus.verifyLength}
                  text="at least 6 characters"
                />
                <Badge
                  status={passwordStatus.verifyNumberAndLetter}
                  text="contains both letters and numbers"
                />
                <Badge
                  status={passwordStatus.verifyCommonPassword}
                  text="no common weak password"
                />
              </div>
            </Form.Item>

            <Form.Item label="Confirm Password">
              {getFieldDecorator('confirm', {
                rules: [
                  {
                    required: true,
                    message: 'Please confirm password',
                  },
                  {
                    validator: this.compareToFirstPassword,
                  },
                ],
              })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
            </Form.Item>

            <Form.Item>
              Back to <a onClick={(e) => this.switchTab(e, 'login')}>Login</a>
            </Form.Item>

            <Form.Item className="display-none">
              <Button htmlType="submit" />
            </Form.Item>
          </Form>
        );
      },
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      shake: false,
      shakeTimer: null,
      firstShow: true,
      contentVisible: true,
      tab: 'login',
      confirmDirty: false,
      verificationCodeRetry: null,
      verificationCodeRetryTimer: null,
      passwordStatus: {
        verifyLength: 'default',
        verifyNumberAndLetter: 'default',
        verifyCommonPassword: 'default',
      },
    };
  }

  // funTransitionHeight reference: @zhangxinxu
  funTransitionHeight(element) {
    if (typeof window.getComputedStyle === 'undefined') {
      return;
    }
    let height = window.getComputedStyle(element).height;
    element.style.transitionProperty = 'none';
    element.style.height = 'auto';
    let targetHeight = window.getComputedStyle(element).height;
    element.style.height = height;
    const __ = element.offsetWidth; // hack
    element.style.transitionProperty = 'height, opacity';
    element.style.height = targetHeight;
  }

  funTransitionOpacity(element) {
    if (typeof window.getComputedStyle === 'undefined') {
      return;
    }
    element.style.transitionProperty = 'none';
    const __ = element.offsetWidth; // hack
    element.style.transitionProperty = 'opacity';
  }

  switchTab = async (e, selectedTab) => {
    e && e.preventDefault();
    const form = this.props.form;
    const modalHeader = document.querySelector(`.${styles.modalTransition} .ant-modal-header`);
    const modalBody = document.querySelector(`.${styles.modalTransition} .ant-modal-body`);
    if (this.state.firstShow) {
      this.funTransitionHeight(modalBody);
      this.setState({ firstShow: false });
    }
    await this.setStatePromise({ contentVisible: false });
    await this.setStatePromise({ tab: selectedTab });
    form.resetFields();
    this.funTransitionOpacity(modalHeader);
    this.funTransitionHeight(modalBody);
    setTimeout(
      () => this.setState({ contentVisible: true }),
      constants.modalAnimationDurationSwitch / 2,
    );
    tracker.event({
      category: 'component.JoinModal',
      action: 'switchTab',
      label: selectedTab,
    });
  };

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords are inconsistent');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  validatePassword = (rule, value, callback) => {
    if(!value || value.length === 0) {
      callback('Please input password');
    }
    // 更新密码强度
    const passwordStatus = {
      verifyLength: WeakPasswordChecker.checkLength(value) ? 'success' : 'error',
      verifyNumberAndLetter: WeakPasswordChecker.checkCharGroup(value) ? 'success' : 'error',
      verifyCommonPassword: WeakPasswordChecker.checkCommonPassword(value) ? 'success' : 'error',
    };
    this.setState({ passwordStatus });
    if(WeakPasswordChecker.isWeak(value)) {
      callback('Your password is too weak');
    }
    callback();
  };

  getVerificationCode = () => {
    const { dispatch, form } = this.props;
    form.validateFields(['email']);
    if (!form.getFieldError('email')) {
      dispatch({
        type: 'verifications/getCode',
        payload: form.getFieldsValue(['email']),
      }).then((ret) => {
        if (ret.success || ret.code === Codes.GENERAL_FLE) {
          msg.success('The verifications code has been sent to your email');
          const { retryAfter } = ret.data;
          this.setState({ verificationCodeRetry: Math.ceil(retryAfter) });
          const timer = setInterval(
            function() {
              this.setState((prevState) => {
                if (prevState.verificationCodeRetry <= 1) {
                  clearInterval(prevState.verificationCodeRetryTimer);
                  return { verificationCodeRetry: null };
                }
                return { verificationCodeRetry: prevState.verificationCodeRetry - 1 };
              });
            }.bind(this),
            1000,
          );
          this.setState({ verificationCodeRetryTimer: timer });
          tracker.event({
            category: 'component.JoinModal',
            action: 'getVerificationCode',
          });
        } else {
          msg.auto(ret);
        }
        setFormErrors(form, ret.errors);
      });
    }
  };

  register = (data) => {
    const { dispatch, form } = this.props;
    data.code = +data.code;
    dispatch({
      type: 'users/register',
      payload: data,
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success(`Welcome to ${constants.siteName}`);
        this.handleHideModel();
        setTimeout(
          () =>
            dispatch({
              type: 'session/fetch',
            }),
          constants.modalAnimationDurationFade,
        );
        tracker.event({
          category: 'component.JoinModal',
          action: 'register',
        });
      } else if (ret.result === 'error') {
        setFormErrors(form, ret.errors);
      }
    });
  };

  login = (data) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'session/login',
      payload: data,
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success(`Welcome back, ${ret.data.nickname}`);
        this.handleHideModel();
        setTimeout(
          () =>
            dispatch({
              type: 'session/setSession',
              payload: { user: ret.data },
            }),
          constants.modalAnimationDurationFade,
        );
        tracker.event({
          category: 'component.JoinModal',
          action: 'login',
        });
      } else if (ret.code === Codes.USER_PASSWORD_STRENGTH_TOO_WEAK) {
        this.switchTab(null, 'resetPasswordAndEmail');
      } else {
        if (this.state.shakeTimer) {
          clearTimeout(this.state.shakeTimer);
        }
        this.setState({ shake: true });
        this.setState({
          shakeTimer: setTimeout(
            () => this.setState({ shake: false }),
            constants.modalAnimationDurationShake,
          ),
        });
      }
    });
  };

  forgotPassword = (data) => {
    const { dispatch, form } = this.props;
    data.code = +data.code;
    dispatch({
      type: 'users/forgotPassword',
      payload: data,
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Your password has been reset successfully');
        this.switchTab(null, 'login');
        tracker.event({
          category: 'component.JoinModal',
          action: 'forgotPassword',
        });
      } else if (ret.result === 'error') {
        setFormErrors(form, ret.errors);
      }
    });
  };

  resetPasswordAndEmail = (data) => {
    const { dispatch } = this.props;
    data.code = +data.code;
    dispatch({
      type: 'users/resetPasswordAndEmail',
      payload: data,
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Your password and email has been reset successfully');
        this.switchTab(null, 'login');
        tracker.event({
          category: 'component.JoinModal',
          action: 'resetPasswordAndEmail',
        });
      } else {
        if (this.state.shakeTimer) {
          clearTimeout(this.state.shakeTimer);
        }
        this.setState({ shake: true });
        this.setState({
          shakeTimer: setTimeout(
            () => this.setState({ shake: false }),
            constants.modalAnimationDurationShake,
          ),
        });
      }
    });
  };

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        switch (this.state.tab) {
          case 'login': {
            this.login(values);
            break;
          }
          case 'register': {
            const data = { ...values };
            delete data.confirm;
            this.register(data);
            break;
          }
          case 'forgotPassword': {
            const data = { ...values };
            delete data.confirm;
            this.forgotPassword(data);
            break;
          }
          case 'resetPasswordAndEmail': {
            const data = { ...values };
            delete data.confirm;
            this.resetPasswordAndEmail(data);
            break;
          }
          default:
        }
      }
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.handleOk();
  };

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    const { onShow } = this.props;
    if (onShow) {
      onShow();
    }
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  componentWillUnmount() {
    clearTimeout(this.state.verificationCodeRetryTimer);
  }

  render() {
    const { children, loading } = this.props;
    const classes = classNames(gStyles.modalForm, gStyles.modalHeightSm, styles.modalTransition, {
      [styles.modalTransitionHide]: !this.state.contentVisible,
      'shake-horizontal shake-constant': this.state.shake,
    });

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title={this.tabs[this.state.tab].title}
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loading[this.state.tab]}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
          className={classes}
          maskClosable={false}
        >
          {this.tabs[this.state.tab].body()}
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: {
      login: !!state.loading.effects['session/login'],
      register: !!state.loading.effects['users/register'],
      verificationCode: !!state.loading.effects['verifications/getCode'],
    },
  };
}

export default connect(mapStateToProps)(Form.create()(JoinModal));
