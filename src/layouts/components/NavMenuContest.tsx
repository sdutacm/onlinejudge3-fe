import React from 'react';
import { connect } from 'dva';
import { Link } from 'react-router-dom';
import { Menu, Icon, Spin, Popover } from 'antd';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import pages from '@/configs/pages';
import gStyles from '../../general.less';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import { matchPath } from 'react-router';
import router from 'umi/router';
import setStatePromise from '@/utils/setStatePromise';
import SettingsModal from '@/components/SettingsModal';
import IdeaNotes from '@/components/IdeaNotes';
import NoteSvg from '@/assets/svg/note.svg';

// Reference https://github.com/id-kemo/responsive-menu-ant-design

interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  onLinkClick: () => void;
  className: string;
  session: ITypeObject<ISessionStatus>;
  globalSession: ISessionStatus;
}

interface State {
  logoutLoading: boolean;
}

class NavMenuContest extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    mobileVersion: false,
    className: 'nav',
  };

  constructor(props) {
    super(props);
    this.state = {
      logoutLoading: false,
    };
  }

  setStatePromise = setStatePromise.bind(this);

  // toggleTheme = () => {
  //   this.props.dispatch({
  //     type: 'settings/setTheme',
  //     payload: { theme: this.props.theme === 'dark' ? 'light' : 'dark' },
  //   })
  // };

  getMatchContest = () => {
    return matchPath(this.props.location.pathname, {
      path: pages.contests.home,
    });
  };

  getContestId = () => {
    const matchContest = this.getMatchContest();
    return +matchContest.params['id'];
  };

  logout = () => {
    this.setState({ logoutLoading: true });
    const { dispatch } = this.props;
    dispatch({
      type: 'contests/logout',
      payload: {
        id: this.getContestId(),
        clearSession: false,
      },
    }).then(ret => {
      msg.auto(ret);
      setTimeout(async () => {
        await this.setStatePromise({ logoutLoading: false });
        router.push(urlf(pages.contests.index, { query: { category: 0 } }));
        dispatch({
          type: 'contests/clearSession',
          payload: {
            id: this.getContestId(),
          },
        });
      }, constants.menuAnimationDurationFade);
    });
  };

  render() {
    const {
      mobileVersion, onLinkClick, className, loading: sessionEffectsLoading, session: allContestSession, location, globalSession,
    } = this.props;
    const loading = sessionEffectsLoading || this.state.logoutLoading;
    const matchContest = this.getMatchContest();
    const id = this.getContestId();
    let session: ISessionStatus = {
      loggedIn: false,
      user: {} as ISession,
    };
    if (allContestSession[id]) {
      session = allContestSession[id];
    }

    let activeLinkKey = location.pathname;
    if (matchContest) {
      for (let key in pages.contests) {
        if (key === 'index' || key === 'home') {
          continue;
        }
        const matchPage = matchPath(location.pathname, {
          path: pages.contests[key],
          // exact: true,
        });
        // console.log(pages.contests[key], matchPage);
        if (matchPage) {
          activeLinkKey = pages.contests[key];
          // console.warn(activeLinkKey, matchPage);
          break;
        }
      }
    }
    return (
      <Menu
        mode={mobileVersion ? 'vertical' : 'horizontal'}
        selectedKeys={[`${activeLinkKey}`]}
        className={className}
      >
        <Menu.Item key={pages.contests.index}>
          <Link to={urlf(pages.contests.index, { query: { category: 0 } })} onClick={onLinkClick}><Icon type="left" /> Contests</Link>
        </Menu.Item>

        {session.loggedIn &&
        <Menu.Item key={pages.contests.overview}>
          <Link to={urlf(pages.contests.overview, { param: matchContest.params })} onClick={onLinkClick}>Overview</Link>
        </Menu.Item>}

        {session.loggedIn &&
        <Menu.Item key={pages.contests.solutions}>
          <Link to={urlf(pages.contests.solutions, { param: matchContest.params })} onClick={onLinkClick}>Solutions</Link>
        </Menu.Item>}

        {session.loggedIn &&
        <Menu.Item key={pages.contests.ranklist}>
          <Link to={urlf(pages.contests.ranklist, { param: matchContest.params })} onClick={onLinkClick}>Ranklist</Link>
        </Menu.Item>}

        {mobileVersion ?
          loading ?
            <Menu.Item key="loading">
              <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
            </Menu.Item>
            :
            session.loggedIn &&
              <Menu.ItemGroup title={<span><span>{session.user.nickname}</span></span>}>
                <Menu.Item key="logout" onClick={() => {
                  onLinkClick();
                  this.logout();
                }}>Logout</Menu.Item>
              </Menu.ItemGroup>
          :
          loading ?
            <Menu.Item key="loading" style={{ float: 'right' }}>
              <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
            </Menu.Item>
            :
            session.loggedIn &&
              <Menu.SubMenu
                title={<span>{session.user.nickname}<Icon type="down" className={gStyles.iconRight} /></span>}
                style={{ float: 'right' }}>
                <Menu.Item key="logout" onClick={this.logout}>Logout</Menu.Item>
              </Menu.SubMenu>
        }

        {!mobileVersion && globalSession.loggedIn &&
        <Menu.Item key="/idea_note" style={{ float: 'right' }}>
          <Popover content={<IdeaNotes />} title="Idea Notes" placement="bottom" trigger="click" overlayClassName="menu-popover">
            <a style={{ left: '2px', position: 'relative' }}><Icon theme="outlined" component={NoteSvg} /></a>
          </Popover>
        </Menu.Item>}

        <Menu.Item key="settings" style={{ float: 'right' }}>
          <SettingsModal>
            <Icon type="setting" />
          </SettingsModal>
        </Menu.Item>
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  const session = state.contests.session;
  return {
    loading: !!state.loading.effects['contests/getSession'] || !!state.loading.effects['contests/logout'],
    session,
    globalSession: state.session,
  };
}

export default connect(mapStateToProps)(NavMenuContest);
