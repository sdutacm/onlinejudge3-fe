import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Spin } from 'antd';
import pages from '@/configs/pages';
import { getPathParamId } from '@/utils/getPathParams';
import constants from '@/configs/constants';
import gStyles from '@/general.less';
import router from 'umi/router';
import { urlf } from '@/utils/format';

interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  detail: IContest;
}

interface State {
}

class ContestBase extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.props.dispatch({
      type: 'contests/getSession',
      payload: +this.props.match.params.id,
    });
  }


  componentWillReceiveProps(nextProps: Readonly<Props>): void {
    // console.log(nextProps.location.pathname);
    if (nextProps.location.pathname !== pages.contests.home &&
      !this.props.session && nextProps.session && !nextProps.session.loggedIn) {
      const id = getPathParamId(nextProps.location.pathname, pages.contests.home);
      router.push(urlf(pages.contests.home, { param: { id }}));
    }
  }

  render() {
    const { loading, session, detail, children } = this.props;
    // console.log('base render', loading, this.props.session, this.props.detail);
    if (loading) {
      return <Spin delay={constants.indicatorDisplayDelay} className={gStyles.spin} />;
    }
    return children;
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    loading: !!state.loading.effects['contests/getSession'],
    session: state.contests.session[id],
    detail: state.contests.detail[id],
  };
}

export default connect(mapStateToProps)(ContestBase);
