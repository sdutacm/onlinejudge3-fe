import React from 'react';
import throttle from 'lodash.throttle';
import { Popover, Icon } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import styles from './ResponsiveNav.less';
import { RouteLocation } from '@/@types/props';
import { connect } from 'dva';

// Powered by https://github.com/id-kemo/responsive-menu-ant-design

export interface Props {
  mobileBreakPoint: number;
  applyViewportChange: number;
  location: RouteLocation;
  placement: TooltipPlacement;
  navMenu: React.ReactNode;
  session: object;
  mobile: boolean;
}

class ResponsiveNav extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    placement: 'bottom',
  };

  state = {
    menuVisible: false,
  };

  handleMenuVisibility = (menuVisible) => {
    this.setState({ menuVisible });
  };

  render() {
    const NavMenu = this.props.navMenu;
    if (!this.props.mobile) {
      // @ts-ignore
      return <NavMenu location={this.props.location} />;
    }

    return (
      <Popover
        // @ts-ignore
        content={<NavMenu
          onLinkClick={() => this.handleMenuVisibility(false)}
          location={this.props.location}
          mobileVersion
        />
        }
        trigger="click"
        placement={this.props.placement}
        visible={this.state.menuVisible}
        onVisibleChange={this.handleMenuVisibility}
      >
        <Icon
          className={styles.iconHamburger}
          type="menu"
        />
      </Popover>
    );
  }
}

function mapStateToProps(state) {
  return {
    mobile: state.global.mobile,
  };
}

export default connect(mapStateToProps)(ResponsiveNav);
