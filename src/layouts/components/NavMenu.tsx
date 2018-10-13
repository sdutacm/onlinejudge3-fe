import React from 'react';
import { connect } from 'dva';
import { Link } from 'react-router-dom';
import { Menu, Icon, Spin, Avatar, Badge, Popover } from 'antd';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import pages from '@/configs/pages';
import JoinModal from './JoinModal';
import gStyles from '../../general.less';
import styles from './ResponsiveNav.less';
import { ReduxProps, RouteProps } from '@/@types/props';
import NoteSvg from '@/assets/svg/note.svg';

// Powered by https://github.com/id-kemo/responsive-menu-ant-design

interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  activeLinkKey: string;
  onLinkClick: () => void;
  className: string;
  session: SessionStatus;
}

class NavMenu extends React.Component<Props, any> {
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
      type: 'session/logout',
    }).then(ret => {
      msg.auto(ret);
    });
  };

  render() {
    const { mobileVersion, onLinkClick, className, loading, session } = this.props;
    let { activeLinkKey } = this.props;
    if (activeLinkKey.startsWith(pages.problems.index)) {
      activeLinkKey = pages.problems.index;
    }
    else if (activeLinkKey.startsWith(pages.contest.index)) {
      activeLinkKey = pages.contest.index;
    }
    return (
      <Menu
        mode={mobileVersion ? 'vertical' : 'horizontal'}
        selectedKeys={[`${activeLinkKey}`]}
        className={className}
      >
        <Menu.Item key={pages.problems.index}>
          <Link to={pages.problems.index} onClick={onLinkClick}>Problems</Link>
        </Menu.Item>

        <Menu.Item key={pages.contest.index}>
          <Link to={pages.contest.index} onClick={onLinkClick}>Contests</Link>
        </Menu.Item>

        <Menu.Item key="/Experiments">
          <Link to={pages.index} onClick={onLinkClick}>Experiments</Link>
        </Menu.Item>

        <Menu.Item key="/Standings">
          <Link to={pages.index} onClick={onLinkClick}>Standings</Link>
        </Menu.Item>

        <Menu.Item key="/Forum">
          <Link to={pages.index} onClick={onLinkClick}>Forum</Link>
        </Menu.Item>

        {mobileVersion && session.loggedIn && <Menu.Item key="/idea_note">
          <Link to={pages.index} onClick={onLinkClick}>Idea Notes</Link>
        </Menu.Item>}
        {mobileVersion && session.loggedIn && <Menu.Item key="/notifications">
          <Link to={pages.index} onClick={onLinkClick}>Notifications</Link>
        </Menu.Item>}

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
                <Menu.Item key="/user">
                  <Link to="/user" onClick={onLinkClick}>User</Link>
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
                <Menu.Item key="/user">
                  <Link to="/user">User</Link>
                </Menu.Item>
                <Menu.Item key="logout" onClick={this.logOut}>Logout</Menu.Item>
              </Menu.SubMenu>
              :
              <Menu.Item key="join" style={{ float: 'right' }}>
                <JoinModal>Join</JoinModal>
              </Menu.Item>
        }

        {!mobileVersion && session.loggedIn && <Menu.Item key="/notifications" style={{ float: 'right' }}>
          <Popover content="" title="Notifications" trigger="click">
            <a><Badge count={3}><Icon type="bell" theme="outlined" /></Badge></a>
          </Popover>
        </Menu.Item>}
        {!mobileVersion && session.loggedIn && <Menu.Item key="/idea_note" style={{ float: 'right' }}>
          <Popover content="" title="Idea Notes" trigger="click">
            <a><Icon theme="outlined" component={NoteSvg} /></a>
          </Popover>
        </Menu.Item>}
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  const session = state.session;
  return {
    loading: !!state.loading.effects['session/fetch'] || !!state.loading.effects['session/logout'],
    session,
  };
}

export default connect(mapStateToProps)(NavMenu);
