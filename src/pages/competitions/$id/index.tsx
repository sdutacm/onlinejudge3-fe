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

interface ICompetitionSessionState extends ICompetitionSessionStatus {
  _code: number;
}

export interface Props extends ReduxProps, RouteProps, FormProps {
  id: number;
  globalSession: ISessionStatus;
  session: ICompetitionSessionState;
}

interface State {}

class CompetitionBase extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
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
              action: 'loginContest',
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
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="content-view-xs center-view">
        <div className="text-center" style={{ marginBottom: '30px' }}>
          <h2>Login Competition</h2>
        </div>
        <div className="center-form">
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

            <Form.Item>
              <Button type="primary" block htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
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
  };
}

export default connect(mapStateToProps)(Form.create()(CompetitionBase));
