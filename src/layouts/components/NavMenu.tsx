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
import { ReduxProps, RouteProps } from '@/@types/props';
import { formatAvatarUrl, urlf } from '@/utils/format';
import router from 'umi/router';
import MessageList from '@/components/MessageList';
import SettingsModal from '@/components/SettingsModal';
import IdeaNotes from '@/components/IdeaNotes';
import NoteSvg from '@/assets/svg/note.svg';

// Reference https://github.com/id-kemo/responsive-menu-ant-design

export interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  onLinkClick: () => void;
  className: string;
  session: ISessionStatus;
  unreadMessagesLoading: boolean;
  unreadMessages: IList<IMessage>;
}

interface State {
  sessionLoaded: boolean;
  messagesVisible: boolean;
  notesVisible: boolean;
}

class NavMenu extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    mobileVersion: false,
    className: 'nav',
  };

  constructor(props) {
    super(props);
    this.state = {
      sessionLoaded: false,
      messagesVisible: false,
      notesVisible: false,
    };
  }

  // toggleTheme = () => {
  //   this.props.dispatch({
  //     type: 'settings/setTheme',
  //     payload: { theme: this.props.theme === 'dark' ? 'light' : 'dark' },
  //   })
  // };

  logout = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'session/logout',
    }).then(ret => {
      msg.auto(ret);
    });
  };

  messagesComponent = () => {
    const { unreadMessagesLoading, unreadMessages: { count, rows }, dispatch } = this.props;
    return (
      <div>
        <MessageList count={count} rows={rows} dispatch={dispatch} loading={unreadMessagesLoading} />
        <div className="text-center" style={{ lineHeight: '45px' }}>
          <Link
            to={urlf(pages.messages.index, { query: { type: 'received' } })}
            onClick={() => this.setState({ messagesVisible: false })}
          >
            View All
          </Link>
        </div>
      </div>
    );
  };

  render() {
    const { mobileVersion, onLinkClick, className, loading, session, location, unreadMessages } = this.props;
    let activeLinkKey = location.pathname;
    if (activeLinkKey.startsWith(pages.problems.index)) {
      activeLinkKey = pages.problems.index;
    }
    if (activeLinkKey.startsWith(pages.sets.index)) {
      activeLinkKey = pages.sets.index;
    }
    if (activeLinkKey.startsWith(pages.topics.index)) {
      activeLinkKey = pages.topics.index;
    }
    if (activeLinkKey.startsWith(pages.posts.index)) {
      activeLinkKey = pages.posts.index;
    }
    const from = location.query.from;
    return (
      <Menu
        mode={mobileVersion ? 'vertical' : 'horizontal'}
        selectedKeys={[`${activeLinkKey}`]}
        className={className}
      >
        {!!(from && activeLinkKey !== pages.sets.index && !activeLinkKey.startsWith(pages.contests.index)) &&
        <Menu.Item key={from}>
          <Link to={from} onClick={onLinkClick}><Icon type="left" /> Set</Link>
        </Menu.Item>}

        <Menu.Item key={pages.problems.index}>
          <Link to={pages.problems.index} onClick={onLinkClick}>Problems</Link>
        </Menu.Item>

        <Menu.Item key={pages.contests.index}>
          <Link to={urlf(pages.contests.index, { query: { category: 0 } })} onClick={onLinkClick}>Contests</Link>
        </Menu.Item>

        {/* <Menu.Item key={pages.sets.index}>
          <Link to={pages.sets.index} onClick={onLinkClick}>Sets</Link>
        </Menu.Item> */}

        <Menu.Item key={pages.users.index}>
          <Link to={pages.users.index} onClick={onLinkClick}>Standings</Link>
        </Menu.Item>

        <Menu.Item key={pages.topics.index}>
          <Link to={pages.topics.index} onClick={onLinkClick}>Topics</Link>
        </Menu.Item>

        <Menu.Item key={pages.posts.index}>
          <Link to={pages.posts.index} onClick={onLinkClick}>Posts</Link>
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
              <Menu.ItemGroup
                title={<span>
                  <Avatar
                    icon="user"
                    src={formatAvatarUrl(session.user.avatar)}
                    className={styles.avatarDefault}
                  />
                  <span style={{ marginLeft: '8px' }}>{session.user.nickname}</span>
                </span>}
              >
                <Menu.Item key="profile">
                  <Link to={urlf(pages.users.detail, { param: { id: session.user.userId } })} onClick={onLinkClick}>Profile</Link>
                </Menu.Item>
                {/* <Menu.Item key="favorites"> */}
                {/* <Link to={pages.favorites.index} onClick={onLinkClick}>Favorites</Link> */}
                {/* </Menu.Item> */}
                <Menu.Item key="logout" onClick={() => {
                  onLinkClick();
                  this.logout();
                }}>Logout</Menu.Item>
              </Menu.ItemGroup>
              :
              <Menu.Item key="join">
                <JoinModal onShow={onLinkClick}>Join</JoinModal>
              </Menu.Item>
          :
          loading ?
            <Menu.Item key="loading" className="float-right">
              <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
            </Menu.Item>
            :
            session.loggedIn ?
              <Menu.SubMenu
                title={<span>
                  <Avatar icon="user" src={formatAvatarUrl(session.user.avatar)} className={styles.avatarDefault} />
                  <Icon type="down" className={gStyles.iconRight} />
                </span>}
                onTitleClick={() => router.push(urlf(pages.users.detail, { param: { id: session.user.userId } }))}
                className="float-right">
                <Menu.Item key="nickname" disabled>
                  <span>{session.user.nickname}</span>
                </Menu.Item>
                <Menu.Item key="profile">
                  <Link to={urlf(pages.users.detail, { param: { id: session.user.userId } })}>Profile</Link>
                </Menu.Item>
                <Menu.Item key="favorites">
                  <Link to={urlf(pages.favorites.index)}>Favorites</Link>
                </Menu.Item>
                {/* <Menu.Item key="favorites"> */}
                {/* <Link to={pages.favorites.index} onClick={onLinkClick}>Favorites</Link> */}
                {/* </Menu.Item> */}
                <Menu.Item key="logout" onClick={this.logout}>Logout</Menu.Item>
              </Menu.SubMenu>
              :
              <Menu.Item key="join" className="float-right">
                <JoinModal>Join</JoinModal>
              </Menu.Item>
        }

        {!mobileVersion && session.loggedIn && <Menu.Item key="unreadMessages" className="float-right">
          <Popover
            content={this.messagesComponent()}
            title="Messages"
            placement="bottom"
            trigger="click"
            overlayClassName="menu-popover no-inner-vertical no-inner-horizontal inner-content-scroll-md"
            overlayStyle={{ minWidth: '320px', maxWidth: '400px' }}
            visible={this.state.messagesVisible}
            onVisibleChange={messagesVisible => this.setState({ messagesVisible })}
          >
            <a><Badge count={unreadMessages.count}><Icon type="bell" theme="outlined" /></Badge></a>
          </Popover>
        </Menu.Item>}
        {!mobileVersion && session.loggedIn && <Menu.Item key="/idea_note" className="float-right">
          <Popover
            content={<IdeaNotes onLinkClick={() => this.setState({ notesVisible: false })} />}
            title="Idea Notes"
            placement="bottom"
            trigger="click"
            overlayClassName="menu-popover inner-content-scroll-md"
            visible={this.state.notesVisible}
            onVisibleChange={notesVisible => this.setState({ notesVisible })}
          >
            <a style={{ left: '2px', position: 'relative' }}><Icon theme="outlined" component={NoteSvg} /></a>
          </Popover>
        </Menu.Item>}
        <Menu.Item key="settings" className="float-right">
          <SettingsModal>
            <Icon type="setting" />
          </SettingsModal>
        </Menu.Item>
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  const session = state.session;
  return {
    loading: !!state.loading.effects['session/fetch'] || !!state.loading.effects['session/logout'],
    session,
    unreadMessagesLoading: !!state.loading.effects['messages/getUnreadList'],
    unreadMessages: state.messages.unread,
  };
}

export default connect(mapStateToProps)(NavMenu);
