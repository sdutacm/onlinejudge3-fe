import React from 'react';
import { connect } from 'dva';
import { Link } from 'react-router-dom';
import { Menu, Icon, Spin } from 'antd';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import pages from '@/configs/pages';
import gStyles from '../../general.less';
import styles from './ResponsiveNav.less';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import { matchPath } from 'react-router';
import router from 'umi/router';

// Reference https://github.com/id-kemo/responsive-menu-ant-design

interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  onLinkClick: () => void;
  className: string;
  session: TypeObject<ISessionStatus>;
}

class NavMenuContest extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    mobileVersion: false,
    className: styles.nav,
  };

  constructor(props) {
    super(props);
    this.state = {
      sessionLoaded: false,
    };
  }

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
    const { dispatch } = this.props;
    dispatch({
      type: 'contests/logout',
      payload: { id: this.getContestId() },
    }).then(ret => {
      msg.auto(ret);
      setTimeout(() => router.push(pages.index), constants.menuAnimationDurationFade);
    });
  };

  render() {
    const { mobileVersion, onLinkClick, className, loading, session: allContestSession, location } = this.props;
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
        const matchPage = matchPath(location.pathname, {
          path: pages.contests[key],
          exact: true,
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
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  const session = state.contests.session;
  return {
    loading: !!state.loading.effects['contests/getSession'] || !!state.loading.effects['contests/logout'],
    session,
  };
}

export default connect(mapStateToProps)(NavMenuContest);
