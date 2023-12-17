/**
 * title: Login Competition
 */

import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import msg from '@/utils/msg';
import router from 'umi/router';
import { urlf } from '@/utils/format';
import tracker from '@/utils/tracker';
import { getCompetitionUserAvailablePages } from '@/utils/competition';
import { ICompetition, ICompetitionSettings } from '@/common/interfaces/competition';
import PageLoading from '@/components/PageLoading';

interface ICompetitionSessionState extends ICompetitionSessionStatus {
  _code: number;
}

export interface Props extends ReduxProps, RouteProps, FormProps {
  id: number;
  globalSession: ISessionStatus;
  session: ICompetitionSessionState;
  detail: ICompetition;
  settings: ICompetitionSettings;
}

type TabType = '' | 'loginGlobal' | 'loginCompetition';

interface State {
  tab: TabType;
}

class CompetitionBase extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  private tabs = {
    loginGlobal: {
      title: 'Login OJ Account',
      body: () => {
        const { settings } = this.props;
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

            {settings.allowedAuthMethods.includes('password') &&
            <Form.Item>
              Switch to <a onClick={e => this.switchTab(e, 'loginCompetition')}>UID/Password Method</a>
            </Form.Item>}

            <Form.Item>
              <Button type="primary" block htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        );
      },
    },

    loginCompetition: {
      title: 'Login Competition',
      body: () => {
        const { globalSession, settings } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
          <Form layout="vertical" hideRequiredMark={true} onSubmit={this.handleSubmit}>
            <Form.Item label="UID">
              {getFieldDecorator('userId', {
                rules: [
                  {
                    required: true,
                    message: 'Please input UID',
                  },
                ],
              })(<Input />)}
            </Form.Item>

            <Form.Item label="Password">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input password' }],
              })(<Input type="password" />)}
            </Form.Item>

            {!globalSession.loggedIn && settings.allowedAuthMethods.includes('session') &&
            <Form.Item>
              Have an OJ account signed up this competition? <a onClick={e => this.switchTab(e, 'loginGlobal')}>Login</a>
            </Form.Item>}

            <Form.Item>
              <Button type="primary" block htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        );
      },
    },
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      tab: props.settings?.allowedAuthMethods.includes('session') ? 'loginGlobal' : 'loginCompetition',
    };
  }

  componentDidMount(): void {
    if (this.props.session.loggedIn) {
      this.redirect(this.props);
    }
  }

  componentWillReceiveProps(nextProps: Readonly<Props>): void {
    if (!this.props.session.loggedIn && nextProps.session.loggedIn) {
      this.redirect(nextProps);
    }
  }

  switchTab = (e, tab) => {
    this.setState({ tab });
    tracker.event({
      category: 'competitions',
      action: 'switchLoginTab',
      label: tab,
    });
  };

  redirect(props: Readonly<Props>) {
    let redirectUri: string = props.location.query.redirect
      ? `/competitions/${props.id}${props.location.query.redirect}`
      : '';
    // const availablePages = getCompetitionUserAvailablePages(props.session.user);
    // const canEnter = availablePages.find(({ url }) => !!matchPath(redirectUri, { path: url }));
    // if (!canEnter) {
    //   redirectUri = '';
    // }
    if (!redirectUri) {
      const pages = getCompetitionUserAvailablePages(props.session.user);
      redirectUri = pages[0]?.url;
    }
    if (redirectUri) {
      router.replace(urlf(redirectUri, { param: { id: props.id } }));
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { id, dispatch } = this.props;
        switch (this.state.tab) {
          case 'loginGlobal': {
            dispatch({
              type: 'session/login',
              payload: values,
            }).then((ret) => {
              msg.auto(ret);
              if (ret.success) {
                msg.success(`Welcome back, ${ret.data.nickname}`);
                tracker.event({
                  category: 'competitions',
                  action: 'loginCompetition',
                  label: this.state.tab,
                });
                dispatch({
                  type: 'session/setSession',
                  payload: { user: ret.data },
                });
                dispatch({
                  type: 'competitions/getSession',
                  payload: {
                    id,
                    force: true,
                  },
                });
              }
            });
            break;
          }
          case 'loginCompetition': {
            dispatch({
              type: 'competitions/login',
              payload: {
                id,
                data: {
                  userId: +values.userId,
                  password: values.password,
                },
              },
            }).then((ret) => {
              msg.auto(ret);
              if (ret.success) {
                msg.success(`Login Success`);
                tracker.event({
                  category: 'competitions',
                  action: 'loginCompetition',
                  label: this.state.tab,
                });
                dispatch({
                  type: 'competitions/getSession',
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
      }
    });
  };

  render() {
    const { tab } = this.state;
    if (!tab) {
      return <PageLoading />;
    }

    return (
      <div className="content-view-xs center-view">
        <div className="text-center" style={{ marginBottom: '30px' }}>
          <h2>{this.tabs[tab].title}</h2>
        </div>
        <div className="center-form">
          {this.tabs[tab].body()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    globalSession: state.session,
    session: state.competitions.session[id],
    detail: state.competitions.detail[id],
    settings: state.competitions.settings[id],
  };
}

export default connect(mapStateToProps)(Form.create()(CompetitionBase));
