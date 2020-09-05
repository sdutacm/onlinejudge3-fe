/**
 * title: SDUT OnlineJudge
 */

import React from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Button, notification, Icon } from 'antd';
import { Link } from 'react-router-dom';
import NavContainer from './components/NavContainer';
import pages from '../configs/pages';
import constants from '../configs/constants';
import styles from './index.less';
import { ReduxProps, RouteProps } from '@/@types/props';
import moment from 'moment';
import { matchPath } from 'react-router';
import classNames from 'classnames';
import router from 'umi/router';
import OJBK from '@/utils/OJBK';
import PageLoading from '@/components/PageLoading';
import { isStateExpired } from '@/utils/misc';
import PageTitle from '@/components/PageTitle';
import 'animate.css';
// @ts-ignore
import pkg from '../../package.json';
import tracker from '@/utils/tracker';
import ExtLink from '@/components/ExtLink';
import throttle from 'lodash.throttle';
import ShowDiscussionModal from '@/components/ShowDiscussionModal';
import NoticeModal from '@/components/NoticeModal';

const VIEWPORT_CHANGE_THROTTLE = 250;

export interface Props extends ReduxProps, RouteProps {
  settings: ISettings;
  session: ISessionStatus;
}

interface State {
  sessionLoaded: boolean;
  error: Error;
  errorStack: string;
  bgCheckSessionTimer: number;
  bgGetUnreadMessagesTimer: number;
}

class Index extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      sessionLoaded: false,
      error: null,
      errorStack: '',
      bgCheckSessionTimer: 0,
      bgGetUnreadMessagesTimer: 0,
    };
  }

  private saveViewportDimensions = throttle(() => {
    this.props.dispatch({
      type: 'global/setViewport',
      payload: {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      },
    });
  }, VIEWPORT_CHANGE_THROTTLE);

  fetchSession = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'session/fetch' }).then(() => {
      this.setState({ sessionLoaded: true });
    });
  };

  bgCheckSession = () => {
    const { dispatch, session } = this.props;
    if (session.loggedIn && isStateExpired(session)) {
      notification.warning({
        message: 'Session Expired',
        description: 'Your session expired. Please re-login.',
        duration: null,
      });
      dispatch({ type: 'session/logout' });
    }
  };

  bgGetUnreadMessages = () => {
    const { dispatch, session } = this.props;
    if (session.loggedIn) {
      dispatch({
        type: 'messages/getUnreadList',
        payload: { userId: session.user.userId },
      });
    }
  };

  async componentDidMount() {
    const settings = this.props.settings;
    document.body.classList.remove('auto');
    document.body.classList.remove('dark');
    if (settings.theme === 'auto') {
      document.body.classList.add('auto');
    } else if (settings.theme === 'dark') {
      document.body.classList.add('dark');
    }

    if (settings.color === 'colorblind-dp') {
      document.body.classList.add('colorblind-dp');
    } else {
      document.body.classList.remove('colorblind-dp');
    }
    const OJBKRes = await OJBK.checkOJBK();
    if (OJBKRes) {
      this.fetchSession();
    } else {
      router.push(pages.OJBK);
    }
    // background timer tasks
    const bgCheckSessionTimer: any = setInterval(
      this.bgCheckSession,
      constants.bgCheckSessionInterval,
    );
    this.setState({ bgCheckSessionTimer });
    const bgGetUnreadMessagesTimer: any = setInterval(
      this.bgGetUnreadMessages,
      constants.bgGetUnreadMessagesInterval,
    );
    this.setState({ bgGetUnreadMessagesTimer });
    // viewport
    this.saveViewportDimensions();
    window.addEventListener('resize', this.saveViewportDimensions);
    // set some methods to window
    // @ts-ignore
    window._router = router;
  }

  componentWillUnmount() {
    clearInterval(this.state.bgCheckSessionTimer);
    clearInterval(this.state.bgGetUnreadMessagesTimer);
    window.removeEventListener('resize', this.saveViewportDimensions);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorStack: errorInfo.componentStack,
    });
    tracker.exception({
      description: error.message + '\n' + errorInfo.componentStack,
      fatal: true,
    });
  }

  render() {
    const { children, location, session } = this.props;
    const { Header, Content, Footer } = Layout;
    if (this.state.error) {
      return (
        <PageTitle title="x_x">
          <div className="center-view text-center">
            <h2 style={{ marginBottom: '30px' }}>Oops... OJ Crashed!</h2>
            <p>
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </p>
            <p>
              <Link
                to={pages.index}
                onClick={() => setTimeout(() => window.location.reload(), 500)}
              >
                <Button>Back to Home</Button>
              </Link>
            </p>
          </div>
        </PageTitle>
      );
    }

    const inBetaPage = matchPath(location.pathname, {
      path: pages.beta,
    });
    if (inBetaPage) {
      return children;
    }

    // if (!inBetaPage) {
    //   router.replace(pages.beta);
    // }

    const inFullWidthPage =
      matchPath(location.pathname, {
        path: pages.users.detail,
        exact: true,
      }) ||
      matchPath(location.pathname, {
        path: pages.groups.detail,
        exact: true,
      });
    const inAdminPage = matchPath(location.pathname, {
      path: pages.admin.index,
    });
    return (
      <Layout
        className={classNames({
          'full-width-page': inFullWidthPage,
        })}
      >
        <Header>
          <Row>
            <Col>
              {!inAdminPage ? (
                <Link to={pages.index} className={styles.logo}>
                  {constants.siteName}
                </Link>
              ) : (
                <span className={classNames(styles.logo, 'cursor-default')}>{session.user?.username || '--'}@sdutoj:/#</span>
              )}
            </Col>
            <Col>{this.state.sessionLoaded && <NavContainer />}</Col>
          </Row>
        </Header>
        <Content>
          <NoticeModal />
          {this.state.sessionLoaded || location.pathname === '/OJBK' ? children : <PageLoading />}
        </Content>
        <Footer className={styles.footer} style={{ paddingTop: '30px', paddingBottom: '30px' }}>
          <Row gutter={20}>
            <Col xs={24} md={8} className="mb-md-lg">
              <h3>About SDUT OJ v{pkg.version}</h3>
              <p>
                <ExtLink
                  className="normal-text-link"
                  href="https://github.com/sdutacm/onlinejudge3-issues"
                >
                  Feedback
                </ExtLink>
              </p>
              <p>
                <ExtLink
                  className="normal-text-link"
                  href="https://github.com/sdutacm/onlinejudge3-issues/blob/master/CHANGELOG.md"
                >
                  Changelog
                </ExtLink>
              </p>
              <p>
                <ExtLink className="normal-text-link" href="https://github.com/sdutacm">
                  GitHub
                </ExtLink>
              </p>
              <p>
                <a className="normal-text-link" href="mailto:sdutacm@163.com">
                  Contact us
                </a>
              </p>
            </Col>

            <Col xs={24} md={8} className="mb-md-lg">
              <h3>Our Apps</h3>
              <p>
                <ExtLink className="normal-text-link" href="https://stepbystep.sdutacm.cn/">
                  StepByStep
                </ExtLink>
              </p>
              <p>
                <ExtLink className="normal-text-link" href="https://acm.sdut.edu.cn/acmss/">
                  ACM Contests Collection
                </ExtLink>
              </p>
              <p>
                <ExtLink
                  className="normal-text-link"
                  href="https://acm.sdut.edu.cn/sdutacm_files/recent_contests_crx.html"
                >
                  Recent Contests
                </ExtLink>
              </p>
              <p>
                <ExtLink className="normal-text-link" href="http://suyu.red/">
                  Typing System
                </ExtLink>
              </p>
            </Col>

            <Col xs={24} md={8} className="mb-md-lg">
              <h3>Recommends</h3>
              <p>
                <ExtLink className="normal-text-link" href="https://ab.algoux.org?from=sdutoj">
                  Algo Bootstrap - The New Coding Experience
                </ExtLink>
              </p>
              <p>
                <ExtLink className="normal-text-link" href="https://contests.sdutacm.cn/">
                  Contests API
                </ExtLink>
              </p>
              <p>
                <ShowDiscussionModal className="normal-text-link">
                  Join Discussion <Icon type="smile" />
                </ShowDiscussionModal>
              </p>
            </Col>
          </Row>
          <p className="mt-lg" style={{ fontWeight: 600 }}>
            © 2008-{moment().format('YYYY')} SDUTACM. All Rights Reserved.
          </p>
          {/* <div> */}
          {/* <a>API</a> */}
          {/* <Divider type="vertical" /> */}
          {/* <a>Feedback</a> */}
          {/* <Divider type="vertical" /> */}
          {/* <a>About Us</a> */}
          {/* </div> */}
        </Footer>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
    settings: state.settings,
  };
}

export default connect(mapStateToProps)(Index);
