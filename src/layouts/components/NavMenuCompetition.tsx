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
import tracker from '@/utils/tracker';
import { getPathParamId } from '@/utils/getPathParams';
import { getCompetitionUserAvailablePages } from '@/utils/competition';

// Reference https://github.com/id-kemo/responsive-menu-ant-design

export interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  onLinkClick: () => void;
  className: string;
  id: number;
  session: ICompetitionSessionStatus;
  globalSession: ISessionStatus;
}

interface State {
  logoutLoading: boolean;
  notesVisible: boolean;
}

class NavMenuCompetition extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    mobileVersion: false,
    className: 'nav',
  };

  private setStatePromise = setStatePromise.bind(this);

  constructor(props) {
    super(props);
    this.state = {
      logoutLoading: false,
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
    this.setState({ logoutLoading: true });
    const { id, dispatch } = this.props;
    dispatch({
      type: 'competitions/logout',
      payload: {
        id,
        clearSession: false,
      },
    }).then((ret) => {
      msg.auto(ret);
      setTimeout(async () => {
        await this.setStatePromise({ logoutLoading: false });
        router.push(pages.index);
        dispatch({
          type: 'competitions/clearSession',
          payload: {
            id,
          },
        });
      }, constants.menuAnimationDurationFade);
    });
  };

  render() {
    const {
      mobileVersion,
      onLinkClick,
      className,
      loading: sessionEffectsLoading,
      session,
      location,
      globalSession,
      id,
    } = this.props;
    const loading = sessionEffectsLoading || this.state.logoutLoading;

    let activeLinkKey = location.pathname;
    if (id) {
      for (let key in pages.competitions) {
        if (key === 'index' || key === 'home') {
          continue;
        }
        const matchPage = matchPath(location.pathname, {
          path: pages.competitions[key],
          // exact: true,
        });
        // console.log(pages.competitions[key], matchPage);
        if (matchPage) {
          activeLinkKey = pages.competitions[key];
          // console.warn(activeLinkKey, matchPage);
          break;
        }
      }
    }
    const availablePages = getCompetitionUserAvailablePages(session.user);

    return (
      <Menu
        mode={mobileVersion ? 'vertical' : 'horizontal'}
        selectedKeys={[`${activeLinkKey}`]}
        className={className}
      >
        <Menu.Item key={pages.index}>
          <Link to={pages.index} onClick={onLinkClick}>
            <Icon type="left" /> Home
          </Link>
        </Menu.Item>

        {availablePages.map(({ title, url }) => (
          <Menu.Item key={url}>
            <Link to={urlf(url, { param: { id } })} onClick={onLinkClick}>
              {title}
            </Link>
          </Menu.Item>
        ))}

        {mobileVersion ? (
          loading ? (
            <Menu.Item key="loading">
              <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
            </Menu.Item>
          ) : (
            session.loggedIn && (
              <Menu.ItemGroup
                title={
                  <span>
                    <span>{session.user.nickname}</span>
                  </span>
                }
              >
                <Menu.Item
                  key="logout"
                  onClick={() => {
                    onLinkClick && onLinkClick();
                    this.logout();
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu.ItemGroup>
            )
          )
        ) : loading ? (
          <Menu.Item key="loading" className="float-right">
            <Spin spinning={loading} size="small" delay={constants.indicatorDisplayDelay} />
          </Menu.Item>
        ) : (
          session.loggedIn && (
            <Menu.SubMenu
              title={
                <span>
                  {session.user.nickname}
                  <Icon type="down" className={gStyles.iconRight} />
                </span>
              }
              style={{ float: 'right' }}
            >
              <Menu.Item key="logout" onClick={this.logout}>
                Logout
              </Menu.Item>
            </Menu.SubMenu>
          )
        )}

        {!mobileVersion && globalSession.loggedIn && (
          <Menu.Item key="/idea_note" className="float-right">
            <Popover
              content={<IdeaNotes onLinkClick={() => this.setState({ notesVisible: false })} />}
              title="Idea Notes"
              placement="bottom"
              trigger="click"
              overlayClassName="menu-popover inner-content-scroll-md"
              visible={this.state.notesVisible}
              onVisibleChange={(notesVisible) => {
                this.setState({ notesVisible });
                if (notesVisible) {
                  tracker.event({
                    category: 'component.NavMenu',
                    action: 'showIdeaNotes',
                  });
                }
              }}
            >
              <a style={{ left: '2px', position: 'relative' }}>
                <Icon theme="outlined" component={NoteSvg} />
              </a>
            </Popover>
          </Menu.Item>
        )}

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
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    loading:
      !!state.loading.effects['competitions/getSession'] ||
      !!state.loading.effects['competitions/logout'],
    id,
    session: state.competitions.session[id] || {
      loggedIn: false,
      user: {},
    },
    globalSession: state.session,
  };
}

export default connect(mapStateToProps)(NavMenuCompetition);
