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
import { matchPath } from 'react-router';
import tracker from '@/utils/tracker';
import ContestTimeStatusWatcher from '@/components/ContestTimeStatusWatcher';
import { ICompetition } from '@/common/interfaces/competition';
import NotFound from '@/pages/404';

export interface Props extends RouteProps, ReduxProps {
  id: number;
  session: ICompetitionSessionStatus;
  detail: ICompetition;
}

interface State {
  currentTime: ITimestamp;
  progressTimer: number;
}

class CompetitionLayout extends React.Component<Props, State> {
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
    if (oldTimeStatus === 'Pending' && newTimeStatus === 'Running') {
      // 比赛开始
      const { id, dispatch } = this.props;
      dispatch({
        type: 'competitions/getDetail',
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
      type: 'competitions/getSession',
      payload: { id },
    });
    dispatch({
      type: 'competitions/getDetail',
      payload: { id },
    });
    if (session && session.loggedIn) {
      // dispatch({
      //   type: 'competitions/getProblems',
      //   payload: { id },
      // });
    }
    const progressTimer: any = setInterval(this.updateProgress, 1000);
    this.setState({ progressTimer });
  }

  componentWillReceiveProps(nextProps: Readonly<Props>): void {
    const { id, dispatch } = nextProps;
    // 用户离开比赛
    if (!id) {
      return;
    }
    // 进入到比赛内部页面，但未获得比赛 session，强制拉回到比赛守卫
    if (
      !matchPath(nextProps.location.pathname, {
        path: pages.competitions.home,
        exact: true,
      }) &&
      !this.props.session &&
      nextProps.session &&
      !nextProps.session.loggedIn
    ) {
      const redirectUri = `${nextProps.location.pathname.replace(/^\/competitions\/\d+/, '')}${
        nextProps.location.search
      }`;
      router.replace(
        urlf(pages.competitions.home, { param: { id }, query: { redirect: redirectUri } }),
      );
    }
    // 用户态变成已登录
    if (
      !(this.props.session && this.props.session.loggedIn) &&
      nextProps.session &&
      nextProps.session.loggedIn
    ) {
      // const availablePages = getCompetitionUserAvailablePages(nextProps.session.user);
      // const canEnter = availablePages.find(
      //   ({ url }) => !!matchPath(nextProps.location.pathname, { path: url }),
      // );
      // if (!canEnter) {
      //   router.replace(urlf(pages.competitions.home, { param: { id } }));
      // }

      // dispatch({
      //   type: 'competitions/getDetail',
      //   payload: {
      //     id,
      //     force: true,
      //   },
      // });
      // dispatch({
      //   type: 'competitions/getProblems',
      //   payload: {
      //     id,
      //     force: true,
      //   },
      // });
    }
    // 用户态变成已登出
    if (
      this.props.session &&
      this.props.session.loggedIn &&
      !(nextProps.session && nextProps.session.loggedIn)
    ) {
      dispatch({
        type: 'competitions/getSession',
        payload: { id },
      });
      router.replace(urlf(pages.competitions.home, { param: { id } }));
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.progressTimer);
  }

  render() {
    const { id, loading, session, detail, children } = this.props;
    const { currentTime } = this.state;
    // console.log('base render', loading, session, detail);
    if (loading) {
      return <PageLoading />;
    } else if (!detail) {
      return <NotFound />;
    }
    // TODO 仅 Running 设置计时器
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    if (!(timeStatus === 'Running' || (timeStatus === 'Ended' && currentTime - endTime < 1000))) {
      return (
        <ContestTimeStatusWatcher contestId={id} timeStatus={timeStatus}>
          {children}
        </ContestTimeStatusWatcher>
      );
    }
    const percent = floor(((currentTime - startTime) / (endTime - startTime)) * 100, 1);
    const timeElapsedSecs = Math.floor((currentTime - startTime) / 1000);
    const timeRemainingSecs = Math.floor((endTime - startTime) / 1000) - timeElapsedSecs;
    return (
      <ContestTimeStatusWatcher contestId={id} timeStatus={timeStatus}>
        <Popover
          placement="bottom"
          content={
            <div className="text-right">
              <div>
                <span className="text-bold">Time Elapsed</span>:{' '}
                {secToTimeStr(timeElapsedSecs, true)}
              </div>
              <div>
                <span className="text-bold">Time Remaining</span>:{' '}
                {secToTimeStr(timeRemainingSecs, true)}
              </div>
            </div>
          }
          onVisibleChange={(visible) => {
            if (visible) {
              tracker.event({
                category: 'competitions',
                action: 'showTimeProgressPopover',
              });
            }
          }}
        >
          <div className="top-progress">
            <Progress strokeLinecap="square" percent={percent} showInfo={false} />
          </div>
        </Popover>
        {children}
      </ContestTimeStatusWatcher>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    loading:
      !state.competitions.session[id] ||
      !!state.loading.effects['competitions/getSession'] ||
      !!state.loading.effects['competitions/getDetail'],
    session: state.competitions.session[id],
    detail: state.competitions.detail[id],
  };
}

export default connect(mapStateToProps)(CompetitionLayout);
