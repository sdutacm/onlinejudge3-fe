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
import { isStateExpired, isCompetitionSide } from '@/utils/misc';
import PageTitle from '@/components/PageTitle';
import 'animate.css';
// @ts-ignore
import pkg from '../../package.json';
import tracker from '@/utils/tracker';
import ExtLink from '@/components/ExtLink';
import throttle from 'lodash.throttle';
import NoticeModal from '@/components/NoticeModal';
import io from 'socket.io-client';
import socketConfig from '@/configs/socket';
import { decodeJudgeStatusBuffer } from '@/utils/judger';
import FullScreenContent from './components/FullScreenContent';
import { userActiveEmitter, UserActiveEvents } from '@/events/userActive';
import { setSocket } from '@/utils/socket';
import AchievementToastContainer from '@/components/AchievementToastContainer';
import 'react-toastify/dist/ReactToastify.css';
import { initGeneralGlobalEvents } from '@/lib/socketHandlers/general/globalEvents';
import { reduxEmitter, ReduxEvents, IReduxEvenData } from '@/events/redux';

const VIEWPORT_CHANGE_THROTTLE = 250;

export interface Props extends ReduxProps, RouteProps {
  settings: ISettings;
  session: ISessionStatus;
  activeUserCount: number;
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

  fetchLanguageConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'solutions/getLanguageConfig',
      payload: {},
    });
  };

  handleReduxDispatch = ({ type, payload }: IReduxEvenData[ReduxEvents.Dispatch]) => {
    this.props.dispatch({
      type,
      payload,
    });
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
    // language config
    this.fetchLanguageConfig();
    // set some methods to window
    // @ts-ignore
    window._router = router;
    // socket
    const judgerSocket = io(socketConfig.judger.url, {
      path: socketConfig.path,
      transports: ['websocket'],
      multiplex: false,
    });
    judgerSocket.on('connect', () => {
      console.log('judger socket connected');
    });
    judgerSocket.on('s', (b) => {
      const event = new CustomEvent('status', { detail: decodeJudgeStatusBuffer(b) });
      // @ts-ignore
      window._eventSource.judger.dispatchEvent(event);
    });
    setSocket('judger', judgerSocket);
    // @ts-ignore
    window._eventSource = {
      judger: document.getElementById('event-source-judger'),
    };
    window.addEventListener('click', this.checkUserActive);
    window.addEventListener('scroll', this.checkUserActive);
    window.addEventListener('keydown', this.checkUserActive);

    // try to load VIN (Very Important Notice)
    fetch(`${process.env.PUBLIC_PATH}vin.txt?_r=${Math.random()}`)
      .then((r) => {
        if (
          r.headers.get('content-type').startsWith('text/plain') &&
          r.status >= 200 &&
          r.status < 400
        ) {
          return r.text();
        }
        throw new Error('No invalid txt');
      })
      .then((res) => {
        const content = res.trim();
        if (content.startsWith('VIN:')) {
          const vin = content.substr(4).trim();
          vin &&
            notification.warning({
              message: 'Important Notice',
              description: vin,
              duration: null,
            });
        }
      })
      .catch((e) => {
        console.log('No vin file, skip.', e);
      });

    initGeneralGlobalEvents();
    reduxEmitter.on(ReduxEvents.Dispatch, this.handleReduxDispatch);
  }

  componentWillUnmount() {
    clearInterval(this.state.bgCheckSessionTimer);
    clearInterval(this.state.bgGetUnreadMessagesTimer);
    window.removeEventListener('resize', this.saveViewportDimensions);
    window.removeEventListener('click', this.checkUserActive);
    window.removeEventListener('scroll', this.checkUserActive);
    window.removeEventListener('keydown', this.checkUserActive);
    reduxEmitter.off(ReduxEvents.Dispatch, this.handleReduxDispatch);
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

  checkUserActive = () => {
    // @ts-ignore
    window._userHasBeenActive = true;
    userActiveEmitter.emit(UserActiveEvents.UserHasBeenActive);
    window.removeEventListener('click', this.checkUserActive);
    window.removeEventListener('scroll', this.checkUserActive);
    window.removeEventListener('keydown', this.checkUserActive);
  };

  render() {
    const { children, location, session, activeUserCount } = this.props;
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
      }) ||
      matchPath(location.pathname, {
        path: pages.competitions.public.intro,
        exact: true,
      }) ||
      matchPath(location.pathname, {
        path: pages.competitions.overview,
        exact: true,
      });
    const inFullHeightPage =
      matchPath(location.pathname, {
        path: pages.competitions.public.intro,
        exact: true,
      }) ||
      matchPath(location.pathname, {
        path: pages.competitions.overview,
        exact: true,
      });
    const inAdminPage = matchPath(location.pathname, {
      path: pages.admin.index,
    });
    const competitionSideAllowedPathPrefixes = ['/competitions', '/stats'];
    const blockedByCompetitionSide =
      isCompetitionSide() &&
      !competitionSideAllowedPathPrefixes.some((p) => location.pathname.startsWith(p));
    const hideNav =
      blockedByCompetitionSide ||
      (isCompetitionSide() &&
        (location.pathname === '/competitions' ||
          location.pathname.startsWith('/competitions-public') ||
          location.pathname.startsWith('/stats')));
    return (
      <Layout
        className={classNames({
          'full-width-page': inFullWidthPage,
          'full-height-page': inFullHeightPage,
        })}
      >
        <Header>
          <Row style={{ display: 'flex' }}>
            <Col>
              {!inAdminPage ? (
                <Link
                  to={isCompetitionSide() ? pages.competitions.index : pages.index}
                  className={styles.logo}
                >
                  {constants.siteName}
                </Link>
              ) : (
                <span className={classNames(styles.logo, 'cursor-default')}>
                  {session.user?.username || '--'}@sdutoj:/#
                </span>
              )}
            </Col>
            {!hideNav && (
              <Col style={{ flex: 1 }}>{this.state.sessionLoaded && <NavContainer />}</Col>
            )}
          </Row>
        </Header>
        <Content>
          <NoticeModal />
          {blockedByCompetitionSide ? (
            <div className="center-view">
              <h3 className="mb-xl">This page is not allowed to access</h3>
              <Link to={pages.competitions.index}>
                <Button type="default">Back to Competitions</Button>
              </Link>
            </div>
          ) : this.state.sessionLoaded || location.pathname === '/OJBK' ? (
            children
          ) : (
            <PageLoading />
          )}
        </Content>
        <Footer className={styles.footer} style={{ paddingTop: '30px', paddingBottom: '30px' }}>
          <Row gutter={20}>
            <Col xs={24} md={8} className="mb-md-lg">
              <h3>
                {constants.siteName} v{pkg.version}
                {isCompetitionSide() ? ' Competition Side' : ''}
              </h3>
              {!isCompetitionSide() && (
                <p>
                  <ExtLink
                    className="normal-text-link"
                    href={constants.githubUrl}
                  >
                    GitHub
                  </ExtLink>
                </p>
              )}
              {!isCompetitionSide() && (
                <p>
                  <a className="normal-text-link" href={`mailto:${constants.contactEmail}`}>
                    Contact us
                  </a>
                </p>
              )}
              <p>
                <Link to={pages.stats.judge} className="normal-text-link">
                  Judge Status
                </Link>
              </p>
              <p>
                <ExtLink href={constants.serviceStatusUrl} className="normal-text-link">
                  Service Status
                </ExtLink>
              </p>
              <p>Current Active Users: {activeUserCount}</p>
            </Col>

            {!isCompetitionSide() && (
              <Col xs={24} md={8} className="mb-md-lg">
                <h3>Our Apps</h3>
                <p>
                  <ExtLink className="normal-text-link" href="https://oj.sdutacm.cn/oj-competition-side-client/?from=sdutoj">
                    Competition Side Client
                  </ExtLink>
                </p>
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
              </Col>
            )}

            {!isCompetitionSide() && (
              <Col xs={24} md={8} className="mb-md-lg">
                <h3>Recommends</h3>
                <p>
                  <ExtLink className="normal-text-link" href="https://rl.algoux.org?from=sdutoj">
                    RankLand - The Great Ranklist Collection
                  </ExtLink>
                </p>
                <p>
                  <ExtLink
                    className="normal-text-link"
                    href="https://github.com/algoux/standard-ranklist"
                  >
                    srk - The General Ranklist Data Format
                  </ExtLink>
                </p>
                <p>
                  <ExtLink className="normal-text-link" href="https://contests.sdutacm.cn/">
                    Contests API
                  </ExtLink>
                </p>
              </Col>
            )}
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
        <FullScreenContent />

        <AchievementToastContainer />
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
    settings: state.settings,
    activeUserCount: state.stats.activeUserCount.count,
  };
}

export default connect(mapStateToProps)(Index);
