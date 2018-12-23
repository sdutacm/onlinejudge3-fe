import React from 'react';
import { connect } from 'dva';
import { Link } from 'react-router-dom';
import { Menu, Icon, Spin, Avatar, Badge, Popover, List, Input, Tag } from 'antd';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import pages from '@/configs/pages';
import JoinModal from './JoinModal';
import gStyles from '../../general.less';
import styles from './ResponsiveNav.less';
import { Location, ReduxProps, RouteProps } from '@/@types/props';
import NoteSvg from '@/assets/svg/note.svg';
import { urlf } from '@/utils/format';
import { matchPath } from 'react-router';
import router from 'umi/router';
import NotFound from '@/pages/404';

// Reference https://github.com/id-kemo/responsive-menu-ant-design

interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  onLinkClick: () => void;
  className: string;
  session: TypeObject<ISession>;
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

  logOut = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contestSession/logout',
    }).then(ret => {
      msg.auto(ret);
      router.push(pages.index);
    });
  };

  render() {
    const { mobileVersion, onLinkClick, className, loading, session: allContestSession, location } = this.props;
    const matchContest = matchPath(location.pathname, {
      path: pages.contests.home,
    });
    const id = ~~matchContest.params['id'];
    let session: ISessionStatus = {
      loggedIn: false,
      user: {} as ISession,
    };
    if (allContestSession[id]) {
      session = {
        loggedIn: true,
        user: allContestSession[id],
      };
    }
    console.log('session', session);

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
        <Menu.Item key={pages.contests.overview}>
          <Link to={urlf(pages.contests.overview, { param: matchContest.params })} onClick={onLinkClick}>Overview</Link>
        </Menu.Item>

        <Menu.Item key={pages.contests.solutions}>
          <Link to={urlf(pages.contests.solutions, { param: matchContest.params })} onClick={onLinkClick}>Solutions</Link>
        </Menu.Item>

        <Menu.Item key={pages.contests.ranklist}>
          <Link to={urlf(pages.contests.ranklist, { param: matchContest.params })} onClick={onLinkClick}>Ranklist</Link>
        </Menu.Item>

        {mobileVersion ?
          loading ?
            <Menu.Item key="loading">
              <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
            </Menu.Item>
            :
            session.loggedIn ?
              <Menu.ItemGroup title={<span><Avatar icon="user"
                                                   src={session.user.avatar}
                                                   className={styles.avatarDefault} /><span style={{ marginLeft: '8px' }}>{session.user.nickname}</span></span>}>
                <Menu.Item key="profile">
                  <Link to={urlf(pages.users.detail, { param: { id: session.user.userId } })} onClick={onLinkClick}>Profile</Link>
                </Menu.Item>
                <Menu.Item key="logout" onClick={() => {
                  onLinkClick();
                  this.logOut();
                }}>Logout</Menu.Item>
              </Menu.ItemGroup>
              :
              <Menu.Item key="join">
                <JoinModal onShow={onLinkClick}>Join</JoinModal>
              </Menu.Item>
          :
          loading ?
            <Menu.Item key="loading" style={{ float: 'right' }}>
              <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
            </Menu.Item>
            :
            session.loggedIn ?
              <Menu.SubMenu
                title={<span><Avatar icon="user" src={session.user.avatar} className={styles.avatarDefault} /><Icon type="down"
                                                                                          className={gStyles.iconRight} /></span>}
                style={{ float: 'right' }}>
                <Menu.Item key="nickname" disabled>
                  <span>{session.user.nickname}</span>
                </Menu.Item>
                <Menu.Item key="profile">
                  <Link  to={urlf(pages.users.detail, { param: { id: session.user.userId } })}>Profile</Link>
                </Menu.Item>
                <Menu.Item key="logout" onClick={this.logOut}>Logout</Menu.Item>
              </Menu.SubMenu>
              :
              <Menu.Item key="join" style={{ float: 'right' }}>
                <JoinModal>Join</JoinModal>
              </Menu.Item>
        }
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  const session = state.contests.session;
  return {
    loading: !!state.loading.effects['session/fetch'] || !!state.loading.effects['session/logout'],
    session,
  };
}

export default connect(mapStateToProps)(NavMenuContest);
