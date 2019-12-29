/**
 * title: SDUT OnlineJudge
 */

import React from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Button, notification } from 'antd';
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
    if (settings.theme === 'dark') {
      document.body.classList.add('dark');
    }
    else {
      document.body.classList.remove('dark');
    }
    if (settings.color === 'colorblind-dp') {
      document.body.classList.add('colorblind-dp');
    }
    else {
      document.body.classList.remove('colorblind-dp');
    }
    const OJBKRes = await OJBK.checkOJBK();
    if (OJBKRes) {
      this.fetchSession();
    }
    else {
      router.push(pages.OJBK);
    }
    // background timer tasks
    const bgCheckSessionTimer: any = setInterval(this.bgCheckSession, constants.bgCheckSessionInterval);
    this.setState({ bgCheckSessionTimer });
    const bgGetUnreadMessagesTimer: any = setInterval(this.bgGetUnreadMessages, constants.bgGetUnreadMessagesInterval);
    this.setState({ bgGetUnreadMessagesTimer });
  }

  componentWillUnmount() {
    clearInterval(this.state.bgCheckSessionTimer);
    clearInterval(this.state.bgGetUnreadMessagesTimer);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorStack: errorInfo.componentStack,
    });
  }

  render() {
    const { children, location } = this.props;
    const { Header, Content, Footer } = Layout;
    if (this.state.error) {
      return (
        <PageTitle title="x_x">
          <div className="center-view text-center">
            <h2 style={{ marginBottom: '30px' }}>Oops... OJ Crashed!</h2>
            <p><Button onClick={() => window.location.reload()}>Reload Page</Button></p>
            <p><Link to={pages.index} onClick={() => setTimeout(() => window.location.reload(), 500)}><Button>Back to Home</Button></Link></p>
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

    const inUserDetailPage = matchPath(location.pathname, {
      path: pages.users.detail,
      exact: true,
    });
    return (
      <Layout className={classNames({
        'user-page': inUserDetailPage,
      })}>
        <Header>
          <Row>
            <Col>
              <Link to={pages.index} className={styles.logo}>{constants.siteName}</Link>
            </Col>
            <Col>
              {this.state.sessionLoaded && <NavContainer />}
            </Col>
          </Row>
        </Header>
        <Content>
          {this.state.sessionLoaded || location.pathname === '/OJBK' ?
            children :
            <PageLoading />}
        </Content>
        <Footer className={styles.footer} style={{ paddingTop:  '30px', paddingBottom: '30px' }}>
          <Row gutter={20}>
            <Col xs={24} md={8} className="mb-md-lg">
              <h3>About</h3>
              <p>SDUT OJ v{pkg.version}</p>
              <p><a className="normal-text-link" href="https://github.com/sdutacm/onlinejudge3-issues" target="_blank">Feedback</a></p>
              <p><a className="normal-text-link" href="https://github.com/sdutacm/onlinejudge3-issues/blob/master/CHANGELOG.md" target="_blank">Changelog</a></p>
              <p><a className="normal-text-link" href="https://github.com/sdutacm" target="_blank">GitHub</a></p>
            </Col>

            <Col xs={24} md={8} className="mb-md-lg">
              <h3>Our Apps</h3>
              <p><a className="normal-text-link" href="https://stepbystep.sdutacm.cn/" target="_blank">StepByStep</a></p>
              <p><a className="normal-text-link" href="https://acm.sdut.edu.cn/acmss/" target="_blank">ACM Contests Collection</a></p>
              <p><a className="normal-text-link" href="https://acm.sdut.edu.cn/sdutacm_files/recent_contests_crx.html" target="_blank">Recent Contests</a></p>
              <p><a className="normal-text-link" href="http://suyu.red/" target="_blank">Typing System</a></p>
            </Col>

            <Col xs={24} md={8} className="mb-md-lg">
              <h3>Recommends</h3>
              <p><a className="normal-text-link" href="https://ab.algoux.org?from=sdutoj" target="_blank">Algo Bootstrap - The New Coding Experience</a></p>
              <p><a className="normal-text-link" href="https://contests.sdutacm.cn/" target="_blank">Contests API</a></p>
            </Col>
          </Row>
          <p className="mt-lg" style={{ fontWeight: 600 }}>© 2008-{moment().format('YYYY')} SDUTACM. All Rights Reserved.</p>
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
