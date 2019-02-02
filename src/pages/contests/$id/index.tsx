/**
 * title: Contest Door
 */

import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import { Codes } from '@/configs/codes/codes';
import styles from './index.less';
import msg from '@/utils/msg';
import router from 'umi/router';
import { urlf } from '@/utils/format';

interface IContestSessionState extends ISessionStatus {
  _code: number;
}

interface Props extends ReduxProps, FormProps {
  id: number;
  globalSession: ISessionStatus;
  session: IContestSessionState;
}

type TabType = '' | 'loginGlobal' | 'enterPassword' | 'loginContest';

interface State {
  tab: TabType;
}

class ContestHome extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    const { session } = this.props;
    let tab: TabType = '';
    switch (session._code) {
      case Codes.R_CONTESTS_NEED_LOGIN_OJ:
        tab = 'loginGlobal';
        break;
      case Codes.R_CONTESTS_NEED_LOGIN_PRIVATE_CONTEST:
        tab = 'enterPassword';
        break;
      case Codes.R_CONTESTS_NEED_LOGIN_REGISTER_CONTEST:
        tab = 'loginContest';
        break;
    }
    this.state = {
      tab,
    };
  }

  componentDidMount(): void {
    if (this.props.session.loggedIn) {
      router.replace(urlf(pages.contests.overview, { param: { id: this.props.id } }));
    }
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!this.props.session.loggedIn && nextProps.session.loggedIn) {
      router.replace(urlf(pages.contests.overview, { param: { id: nextProps.id } }));
    }
  }

  switchTab = (e, tab) => {
    this.setState({ tab });
  };

  tabs = {
    loginGlobal: {
      title: 'Login OJ to View',
      body: () => {
        const { globalSession, session } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item label="Email or Username">
              {getFieldDecorator('loginName', {
                rules: [{
                  required: true, message: 'Please input email or username',
                }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Password">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input password' }],
              })(<Input type="password" />)}
            </Form.Item>

            {!globalSession.loggedIn && session._code === Codes.R_CONTESTS_NEED_LOGIN_REGISTER_CONTEST &&
            <Form.Item>
              Switch to <a onClick={e => this.switchTab(e, 'loginContest')}>Login Contest</a>
            </Form.Item>}

            <Form.Item>
              <Button type="primary" block htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        );
      }
    },

    enterPassword: {
      title: 'Enter Password to View',
      body: () => {
        const { getFieldDecorator } = this.props.form;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item label="Contest Password">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input password' }],
              })(<Input type="password" />)}
            </Form.Item>

            <Form.Item>
              <Button type="primary" block htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        );
      },
    },

    loginContest: {
      title: 'Login Contest to View',
      body: () => {
        const { globalSession } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item label="Contest Username">
              {getFieldDecorator('username', {
                rules: [{
                  required: true, message: 'Please input contest username',
                }],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Password">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input password' }],
              })(<Input type="password" />)}
            </Form.Item>

            {!globalSession.loggedIn &&
            <Form.Item>
              Have an OJ account joined the contest? <a onClick={e => this.switchTab(e, 'loginGlobal')}>Login OJ</a>
            </Form.Item>}

            <Form.Item>
              <Button type="primary" block htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        );
      },
    },
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { id, dispatch } = this.props;
        switch (this.state.tab) {
          case 'loginGlobal':
            dispatch({
              type: 'session/login',
              payload: values,
            }).then(ret => {
              msg.auto(ret);
              if (ret.success) {
                msg.success(`Welcome back, ${ret.data.nickname}`);
                dispatch({
                  type: 'session/setSession',
                  payload: { user: ret.data },
                });
                dispatch({
                  type: 'contests/getSession',
                  payload: {
                    id,
                    force: true,
                  },
                });
              }
            });
            break;
          case 'enterPassword':
            dispatch({
              type: 'contests/login',
              payload: {
                id,
                data: values,
              },
            }).then(ret => {
              msg.auto(ret);
              if (ret.success) {
                msg.success(`Login Success`);
                dispatch({
                  type: 'contests/getSession',
                  payload: {
                    id,
                    force: true,
                  },
                });
              }
            });
            break;
          case 'loginContest':
            dispatch({
              type: 'contests/login',
              payload: {
                id,
                data: values,
              },
            }).then(ret => {
              msg.auto(ret);
              if (ret.success) {
                msg.success(`Login Success`);
                dispatch({
                  type: 'contests/getSession',
                  payload: {
                    id,
                    force: true,
                  },
                });
              }
            });
            break;
        }
      }
    });
  };

  render() {
    const { tab } = this.state;
    if (tab) {
      return (
        <div className="content-view-xs center-view">
          <div className={styles.header}>
            <h2>{this.tabs[tab].title}</h2>
          </div>
          <div className="center-form">
            {this.tabs[tab].body()}
          </div>
        </div>
      );
    }
    return null;
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    globalSession: state.session,
    session: state.contests.session[id],
  };
}

export default connect(mapStateToProps)(Form.create()(ContestHome));
