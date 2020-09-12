import React from 'react';
import { connect } from 'dva';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { matchPath } from 'react-router';
import setStatePromise from '@/utils/setStatePromise';
import SettingsModal from '@/components/SettingsModal';

export interface Props extends ReduxProps, RouteProps {
  mobileVersion: boolean;
  onLinkClick: () => void;
  className: string;
  session: ISessionStatus;
}

interface State {}

class NavMenuAdmin extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    mobileVersion: false,
    className: 'nav',
  };

  private setStatePromise = setStatePromise.bind(this);

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { mobileVersion, onLinkClick, className, location } = this.props;
    let activeLinkKey = location.pathname;
    for (let key in pages.admin) {
      if (key === 'index') {
        continue;
      }
      const matchPage = matchPath(location.pathname, {
        path: pages.admin[key],
        // exact: true,
      });
      if (matchPage) {
        activeLinkKey = pages.admin[key];
        break;
      }
    }
    return (
      <Menu
        mode={mobileVersion ? 'vertical' : 'horizontal'}
        selectedKeys={[`${activeLinkKey}`]}
        className={className}
      >
        <Menu.Item key="_back">
          <Link to={pages.index} onClick={onLinkClick}>
            <Icon type="left" /> Home
          </Link>
        </Menu.Item>

        <Menu.Item key={pages.admin.problems}>
          <Link to={pages.admin.problems} onClick={onLinkClick}>
            Problems
          </Link>
        </Menu.Item>

        <Menu.Item key={pages.admin.tags}>
          <Link to={pages.admin.tags} onClick={onLinkClick}>
            Tags
          </Link>
        </Menu.Item>

        <Menu.Item key={pages.admin.contests}>
          <Link to={pages.admin.contests} onClick={onLinkClick}>
            Contests
          </Link>
        </Menu.Item>

        <Menu.Item key={pages.admin.users}>
          <Link to={pages.admin.users} onClick={onLinkClick}>
            Users
          </Link>
        </Menu.Item>

        <Menu.Item key={pages.admin.posts}>
          <Link to={pages.admin.posts} onClick={onLinkClick}>
            Posts
          </Link>
        </Menu.Item>

        <Menu.Item key={pages.admin.groups}>
          <Link to={pages.admin.groups} onClick={onLinkClick}>
            Groups
          </Link>
        </Menu.Item>

        <Menu.Item key={pages.admin.judger}>
          <Link to={pages.admin.judger} onClick={onLinkClick}>
            Judger
          </Link>
        </Menu.Item>

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
  const session = state.contests.session;
  return {
    session,
  };
}

export default connect(mapStateToProps)(NavMenuAdmin);
