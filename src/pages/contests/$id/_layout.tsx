import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Spin, Progress, Popover } from 'antd';
import pages from '@/configs/pages';
import { getPathParamId } from '@/utils/getPathParams';
import constants from '@/configs/constants';
import gStyles from '@/general.less';
import router from 'umi/router';
import { secToTimeStr, toLongTs, urlf } from '@/utils/format';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import { floor } from 'math-precision';

interface Props extends RouteProps, ReduxProps {
  id: number;
  session: ISessionStatus;
  detail: IContest;
}

interface State {
  currentTime: Timestamp;
  progressTimer: number;
}

class ContestBase extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentTime: Date.now() - ((window as any)._t_diff || 0),
      progressTimer: 0,
    };
  }

  updateProgress = () => {
    this.setState({ currentTime: Date.now() - ((window as any)._t_diff || 0) });
  };

  componentDidMount(): void {
    const { id, session, dispatch } = this.props;
    dispatch({
      type: 'contests/getSession',
      payload: { id },
    });
    if (session && session.loggedIn) {
      dispatch({
        type: 'contests/getDetail',
        payload: { id },
      });
    }
    const progressTimer: any = setInterval(this.updateProgress, 1000);
    this.setState({ progressTimer });
  }

  componentWillReceiveProps(nextProps: Readonly<Props>): void {
    // console.log(nextProps.location.pathname);
    const id = getPathParamId(nextProps.location.pathname, pages.contests.home);
    if (nextProps.location.pathname !== pages.contests.home &&
      !this.props.session && nextProps.session && !nextProps.session.loggedIn) {
      router.replace(urlf(pages.contests.home, { param: { id }}));
    }
    if (!(this.props.session && this.props.session.loggedIn) && nextProps.session && nextProps.session.loggedIn) {
      this.props.dispatch({
        type: 'contests/getDetail',
        payload: { id },
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.progressTimer);
  }

  render() {
    const { loading, session, detail, children } = this.props;
    const { currentTime } = this.state;
    // console.log('base render', loading, session);
    if (loading) {
      return <Spin delay={constants.indicatorDisplayDelay} className={gStyles.spin} />;
    }
    else if (!detail) {
      return <div>{children}</div>;
    }
    // TODO 仅 Running 设置计时器
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    if (!(timeStatus === 'Running' || currentTime - endTime < 1000)) {
      return <div>{children}</div>;
    }
    const percent = floor((currentTime - startTime) / (endTime - startTime) * 100, 1);
    const timeElapsedSecs = Math.floor((currentTime - startTime) / 1000);
    const timeRemainingSecs = Math.floor((endTime - startTime) / 1000) - timeElapsedSecs;
    return (
      <div>
        <Popover placement="bottom" content={
          <div className="text-right">
            <div><span className="text-bold">Time Elapsed</span>: {secToTimeStr(timeElapsedSecs, true)}</div>
            <div><span className="text-bold">Time Remaining</span>: {secToTimeStr(timeRemainingSecs, true)}</div>
          </div>
        }>
          <div className="top-progress">
            <Progress strokeLinecap="square" percent={percent} showInfo={false} />
          </div>
        </Popover>
        {children}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    loading: !state.contests.session[id] || !!state.loading.effects['contests/getSession'],
    session: state.contests.session[id],
    detail: state.contests.detail[id],
  };
}

export default connect(mapStateToProps)(ContestBase);
