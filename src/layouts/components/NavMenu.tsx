import React from 'react';
import { connect } from 'dva';
import { Link } from 'react-router-dom';
import { Menu, Icon, Spin, Avatar, Badge, Popover, List, Input, Tag, Collapse, Divider } from 'antd';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import pages from '@/configs/pages';
import JoinModal from './JoinModal';
import gStyles from '../../general.less';
import styles from './ResponsiveNav.less';
import { ReduxProps, RouteProps } from '@/@types/props';
import NoteSvg from '@/assets/svg/note.svg';
import ThemeSvg from '@/assets/svg/theme.svg';
import moment from 'moment';
import { formatAvatarUrl, urlf } from '@/utils/format';
import router from 'umi/router';
import xss from 'xss';

// Reference https://github.com/id-kemo/responsive-menu-ant-design

interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  onLinkClick: () => void;
  className: string;
  session: ISessionStatus;
  theme: ITheme;
  unreadMessages: IList<IMessage>;
}

class NavMenu extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    mobileVersion: false,
    className: 'nav',
  };

  constructor(props) {
    super(props);
    this.state = {
      sessionLoaded: false,
    };
  }

  ideaNotesList = [
    { content: '这货可能是个 dp', tmpTag: (<Tag><a>cyk的游戏</a></Tag>), time: 1539733234 },
    { content: '赛时漏了 12 点的情况，回头补一下', tmpTag: (<Tag><a>2018 年寒假集训选拔 / A - 时间格式转换</a></Tag>), time: 1539733234 },
  ];

  ideaNotes = (
    <div>
      <Input.TextArea rows={2} placeholder="Type new idea..." />
      <List
        itemLayout="horizontal"
        size="small"
        // loadMore={() => console.log('more')}
        dataSource={this.ideaNotesList}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={<a>{item.content}</a>}
              description={item.tmpTag}
            />
          </List.Item>
        )}
      />
    </div>
  );

  toggleTheme = () => {
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme: this.props.theme === 'dark' ? 'light' : 'dark' },
    })
  };

  logout = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'session/logout',
    }).then(ret => {
      msg.auto(ret);
    });
  };

  messagesComponent = () => {
    const { unreadMessages: { count, rows }, dispatch } = this.props;
    return (
      <div>
        {count ?
          <Collapse bordered={false} className="message-list">
            {rows.map(m =>
              <Collapse.Panel showArrow={false}
                              key={`${m.messageId}`}
                              header={<div>
                                <div><a className="normal-text-link">{m.title}</a></div>
                                <div className="message-footer">
                                  {m.from.userId ?
                                    <Link to={urlf(pages.users.detail, { param: { id: m.from.userId } })}
                                          className="normal-text-link"
                                          onClick={e => e.stopPropagation()}
                                    >{m.from.nickname}</Link> :
                                    <span>System</span>
                                  }
                                  <span className="ml-md-lg">{moment(m.createdAt * 1000).fromNow()}</span>
                                  <a className="ml-md-lg mark-as-read" onClick={e => {
                                    e.stopPropagation();
                                    dispatch({
                                      type: 'messages/markRead',
                                      payload: {
                                        id: m.messageId,
                                        read: true,
                                      },
                                    }).then(ret => msg.auto(ret));
                                  }}>Mark as read</a>
                                </div>
                              </div>}>
                <div dangerouslySetInnerHTML={{ __html: xss(m.content.replace(/\n/g, '<br />')) }} />
              </Collapse.Panel>
            )}
          </Collapse> :
          <div>
            <div className="text-center" style={{ lineHeight: '60px' }}>No New Message</div>
            <Divider style={{ margin: '0' }} />
          </div>
        }
        <div className="text-center" style={{ lineHeight: '45px' }}><Link to={'/'}>View All</Link></div>
      </div>
    );
  };

  render() {
    const { mobileVersion, onLinkClick, className, loading, session, location, theme, unreadMessages } = this.props;
    let activeLinkKey = location.pathname;
    if (activeLinkKey.startsWith(pages.problems.index)) {
      activeLinkKey = pages.problems.index;
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

        <Menu.Item key={pages.contests.index}>
          <Link to={urlf(pages.contests.index, { query: { category: 0 } })} onClick={onLinkClick}>Contests</Link>
        </Menu.Item>

        <Menu.Item key={pages.users.index}>
          <Link to={pages.users.index} onClick={onLinkClick}>Standings</Link>
        </Menu.Item>

        {/*<Menu.Item key="/Forum">*/}
          {/*<Link to={pages.index} onClick={onLinkClick}>Forum</Link>*/}
        {/*</Menu.Item>*/}

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
                                                   src={formatAvatarUrl(session.user.avatar)}
                                                   className={styles.avatarDefault} /><span style={{ marginLeft: '8px' }}>{session.user.nickname}</span></span>}>
                <Menu.Item key="profile">
                  <Link to={urlf(pages.users.detail, { param: { id: session.user.userId } })} onClick={onLinkClick}>Profile</Link>
                </Menu.Item>
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
            <Menu.Item key="loading" style={{ float: 'right' }}>
              <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
            </Menu.Item>
            :
            session.loggedIn ?
              <Menu.SubMenu title={<span>
                  <Avatar icon="user" src={formatAvatarUrl(session.user.avatar)} className={styles.avatarDefault} />
                  <Icon type="down" className={gStyles.iconRight} />
                </span>}
                            onTitleClick={() => router.push(urlf(pages.users.detail, { param: { id: session.user.userId } }))}
                            style={{ float: 'right' }}>
                <Menu.Item key="nickname" disabled>
                  <span>{session.user.nickname}</span>
                </Menu.Item>
                <Menu.Item key="profile">
                  <Link to={urlf(pages.users.detail, { param: { id: session.user.userId } })}>Profile</Link>
                </Menu.Item>
                <Menu.Item key="logout" onClick={this.logout}>Logout</Menu.Item>
              </Menu.SubMenu>
              :
              <Menu.Item key="join" style={{ float: 'right' }}>
                <JoinModal>Join</JoinModal>
              </Menu.Item>
        }

        {!mobileVersion && session.loggedIn && <Menu.Item key="messages" style={{ float: 'right' }}>
          <Popover content={this.messagesComponent()}
                   title="Messages"
                   placement="bottom"
                   trigger="click"
                   overlayClassName="menu-popover no-inner-vertical no-inner-horizontal inner-content-scroll-md"
                   overlayStyle={{ width: '400px' }}
          >
            <a><Badge count={unreadMessages.count}><Icon type="bell" theme="outlined" /></Badge></a>
          </Popover>
        </Menu.Item>}
        {/*{!mobileVersion && session.loggedIn && <Menu.Item key="/idea_note" style={{ float: 'right' }}>*/}
          {/*<Popover content={this.ideaNotes} title="Idea Notes" placement="bottom" trigger="click" overlayClassName="menu-popover">*/}
            {/*<a><Icon theme="outlined" component={NoteSvg} /></a>*/}
          {/*</Popover>*/}
        {/*</Menu.Item>}*/}
        <Menu.Item key="theme" style={{ float: 'right' }} onClick={this.toggleTheme}>
          <Popover content={theme === 'light' ? 'Go to Deep Dark Fantasy' : 'Back to Real Light World'}
                   mouseEnterDelay={5}>
            <a><Icon component={ThemeSvg} /></a>
          </Popover>
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
    theme: state.settings.theme,
    unreadMessages: state.messages.unread,
  };
}

export default connect(mapStateToProps)(NavMenu);
