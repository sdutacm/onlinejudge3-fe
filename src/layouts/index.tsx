import React from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Spin, Divider, Button, notification } from 'antd';
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

interface Props extends ReduxProps, RouteProps {
  theme: ITheme;
}

interface State {
  sessionLoaded: boolean;
  error: Error;
  errorStack: string;
  bgCheckSessionTimer: number;
}

class Index extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      sessionLoaded: false,
      error: null,
      errorStack: '',
      bgCheckSessionTimer: 0,
    };
  }

  fetchSession = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'session/fetch' }).then(() => {
      this.setState({ sessionLoaded: true });
    });
  };

  bgCheckSession = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'session/getSession' }).then(session => {
      if (session.loggedIn && isStateExpired(session)) {
        notification.warning({
          message: 'Session Expired',
          description: 'Your session expired. Please re-login.',
          duration: null,
        });
        dispatch({type: 'session/logout' });
      }
    });
  };

  async componentDidMount() {
    if (this.props.theme === 'dark') {
      document.body.classList.add('dark');
    }
    else {
      document.body.classList.remove('dark');
    }
    const OJBKRes = await OJBK.checkOJBK();
    if (OJBKRes) {
      this.fetchSession();
    }
    else {
      router.push(pages.OJBK);
    }
    const bgCheckSessionTimer: any = setInterval(this.bgCheckSession, 60 * 1000);
    this.setState({ bgCheckSessionTimer });
  }

  componentWillUnmount() {
    clearInterval(this.state.bgCheckSessionTimer);
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
        <div className="center-view text-center">
          <h2 style={{ marginBottom: '30px' }}>Oops... OJ Crashed!</h2>
          <p><Button onClick={() => window.location.reload()}>Reload Page</Button></p>
          <p><Link to={pages.index} onClick={() => setTimeout(() => window.location.reload(), 500)}><Button>Back to Home</Button></Link></p>
        </div>
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
          {this.state.sessionLoaded || location.pathname === '/OJBK' ? children :
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
    theme: state.settings.theme,
  };
}


export default connect(mapStateToProps)(Index);
