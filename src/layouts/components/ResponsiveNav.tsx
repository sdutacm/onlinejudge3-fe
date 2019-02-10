import React from 'react';
import throttle from 'lodash.throttle';
import { Popover, Icon } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import styles from './ResponsiveNav.less';
import { RouteLocation } from '@/@types/props';

// Powered by https://github.com/id-kemo/responsive-menu-ant-design

interface Props {
  mobileBreakPoint: number;
  applyViewportChange: number;
  location: RouteLocation;
  placement: TooltipPlacement;
  navMenu: React.ReactNode;
  session: object;
}

class ResponsiveNav extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    mobileBreakPoint: 768,
    applyViewportChange: 250,
    placement: 'bottom',
  };

  state = {
    viewportWidth: 0,
    menuVisible: false,
  };

  componentDidMount() {
    this.saveViewportDimensions();
    window.addEventListener('resize', this.saveViewportDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.saveViewportDimensions);
  }

  handleMenuVisibility = (menuVisible) => {
    this.setState({ menuVisible });
  };

  saveViewportDimensions = throttle(() => {
    this.setState({
      viewportWidth: window.innerWidth,
    });
  }, this.props.applyViewportChange);

  render() {
    const NavMenu = this.props.navMenu;
    if (this.state.viewportWidth >= this.props.mobileBreakPoint) {
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

export default ResponsiveNav;
