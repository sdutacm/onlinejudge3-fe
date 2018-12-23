import React from 'react';
import withRouter from 'umi/withRouter';
import NavMenu from './NavMenu';
import NavMenuContest from '@/layouts/components/NavMenuContest';
import ResponsiveNav from './ResponsiveNav';
import { RouteProps } from '@/@types/props';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';

interface Props extends RouteProps {
}

const NavContainer: React.StatelessComponent<Props> = ({ location }) => {
  const matchContest = matchPath(location.pathname, {
    path: pages.contests.home,
  });
  return (
    <ResponsiveNav
      location={location}
      navMenu={matchContest ? NavMenuContest : NavMenu}
      placement="bottom"
    />
  )
};

const component: any = withRouter(NavContainer);
export default component;
