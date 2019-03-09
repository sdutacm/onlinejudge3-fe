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

interface Props extends ReduxProps, RouteProps {
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
        <Footer className={styles.footer}>
          <p>© 2008-{moment().format('YYYY')} SDUTACM Team. All Rights Reserved.</p>
          {/*<div>*/}
            {/*<a>API</a>*/}
            {/*<Divider type="vertical" />*/}
            {/*<a>Feedback</a>*/}
            {/*<Divider type="vertical" />*/}
            {/*<a>About Us</a>*/}
          {/*</div>*/}
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
