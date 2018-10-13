import React from 'react';
import withRouter from 'umi/withRouter';
import NavMenu from './NavMenu';
import ResponsiveNav from './ResponsiveNav';
import { RouteProps } from '@/@types/props';

interface Props extends RouteProps {
}

const NavContainer: React.StatelessComponent<Props> = ({ location }) => (
  <ResponsiveNav
    activeLinkKey={location.pathname}
    navMenu={NavMenu}
    placement="bottom"
  />
);

const component: any = withRouter(NavContainer);
export default component;
