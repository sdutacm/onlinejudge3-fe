import React from 'react';
import withRouter from 'umi/withRouter';
import NavMenu from './NavMenu';
import NavMenuContest from './NavMenuContest';
import NavMenuCompetition from './NavMenuCompetition';
import NavMenuAdmin from './NavMenuAdmin';
import ResponsiveNav from './ResponsiveNav';
import { RouteProps } from '@/@types/props';
import pages from '@/configs/pages';
import { matchPath } from 'react-router';

interface Props extends RouteProps {}

const NavContainer: React.FC<Props> = ({ location }) => {
  const matchContest = matchPath(location.pathname, {
    path: pages.contests.home,
  });
  const matchCompetition = matchPath(location.pathname, {
    path: pages.competitions.home,
  });
  const matchAdmin = matchPath(location.pathname, {
    path: pages.admin.index,
  });
  return (
    <ResponsiveNav
      location={location}
      navMenu={
        matchContest
          ? NavMenuContest
          : matchCompetition
          ? NavMenuCompetition
          : matchAdmin
          ? NavMenuAdmin
          : NavMenu
      }
      placement="bottom"
    />
  );
};

const component: any = withRouter(NavContainer);
export default component;
