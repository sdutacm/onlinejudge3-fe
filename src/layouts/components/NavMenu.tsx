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
import NoteSvg from '@/assets/svg/note.svg';
import moment from 'moment';

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

  notificationsList = [
    { notificationId: 1, title: 'lxh mentioned you at a discussion', time: 1539733234 },
    { notificationId: 2, title: 'bLue answered your question', time: 1539733234 },
    { notificationId: 3, title: 'Your contest register has been accepted', time: 1539733234 },
  ];

  notifications = (
    <List
      itemLayout="horizontal"
      size="small"
      // loadMore={() => console.log('more')}
      dataSource={this.notificationsList.slice(0, 3)}
      renderItem={item => (
        <List.Item actions={[<a key={item.notificationId}>View</a>]}>
            <List.Item.Meta
              title={<a>{item.title}</a>}
              description={moment(item.time * 1000).fromNow()}
            />
        </List.Item>
      )}
      footer={(<a><div className="text-center" style={{ paddingBottom: 0 }}>View All</div></a>)}
    />
  );

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
          <Popover content={this.notifications} title="Notifications" placement="bottom" trigger="click" overlayClassName="menu-popover no-inner-vertical">
            <a><Badge count={3}><Icon type="bell" theme="outlined" /></Badge></a>
          </Popover>
        </Menu.Item>}
        {!mobileVersion && session.loggedIn && <Menu.Item key="/idea_note" style={{ float: 'right' }}>
          <Popover content={this.ideaNotes} title="Idea Notes" placement="bottom" trigger="click" overlayClassName="menu-popover">
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
