import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Progress, Popover } from 'antd';
import pages from '@/configs/pages';
import { getPathParamId } from '@/utils/getPathParams';
import router from 'umi/router';
import { secToTimeStr, toLongTs, urlf } from '@/utils/format';
import getSetTimeStatus, { ContestTimeStatus } from '@/utils/getSetTimeStatus';
import { floor } from 'math-precision';
import setStatePromise from '@/utils/setStatePromise';
import PageLoading from '@/components/PageLoading';

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
  setStatePromise = setStatePromise.bind(this);

  constructor(props) {
    super(props);
    this.state = {
      currentTime: Date.now() - ((window as any)._t_diff || 0),
      progressTimer: 0,
    };
  }

  getContestTimeStatus = (): ContestTimeStatus | '' => {
    const { detail } = this.props;
    if (!detail) {
      return '';
    }
    const { currentTime } = this.state;
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    return getSetTimeStatus(startTime, endTime, currentTime);
  };

  updateProgress = async () => {
    const oldTimeStatus = this.getContestTimeStatus();
    if (oldTimeStatus === 'Ended') {
      if (this.state.currentTime - toLongTs(this.props.detail.endAt) >= 1000) {
        clearInterval(this.state.progressTimer);
        return;
      }
    }
    await this.setStatePromise({ currentTime: Date.now() - ((window as any)._t_diff || 0) });
    const newTimeStatus = this.getContestTimeStatus();
    if (oldTimeStatus === 'Pending' && newTimeStatus === 'Running') { // 比赛开始
      const { id, dispatch } = this.props;
      dispatch({
        type: 'contests/getDetail',
        payload: {
          id,
          force: true,
        },
      });
      dispatch({
        type: 'contests/getProblems',
        payload: {
          id,
          force: true,
        },
      });
    }
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
      dispatch({
        type: 'contests/getProblems',
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
        payload: {
          id,
          force: true,
        },
      });
      this.props.dispatch({
        type: 'contests/getProblems',
        payload: {
          id,
          force: true,
        },
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
      return <PageLoading />;
    }
    else if (!detail) {
      return <div>{children}</div>;
    }
    // TODO 仅 Running 设置计时器
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    if (!(timeStatus === 'Running' || (timeStatus === 'Ended' && currentTime - endTime < 1000))) {
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
