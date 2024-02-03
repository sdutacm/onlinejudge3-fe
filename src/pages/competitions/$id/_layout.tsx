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
import { ECompetitionUserRole } from '@/common/enums';
import { ICompetitionEvenData, CompetitionEvents, competitionEmitter } from '@/events/competition';
import ReactPlayer from 'react-player/file';
import { userActiveEmitter, UserActiveEvents } from '@/events/userActive';
import { pickGenshinAudioUrlFromConf } from '@/utils/spGenshin';
import { Howl } from 'howler';
import staticUrls from '@/configs/staticUrls';

const SP_GENSHIN_LAUNCHING_AUDIO_DURATION = 1 * 60 + 40;
const SP_GENSHIN_LAUNCHING_AUDIO_PLAY_OFFSET = -2;

export interface Props extends RouteProps, ReduxProps {
  id: number;
  session: ICompetitionSessionStatus;
  detail: ICompetition;
  settingsTheme: ISettingsTheme;
}

interface State {
  currentTime: ITimestamp;
  progressTimer: number;
  audioUrl: string;
  audioPlaying: boolean;
}

class CompetitionLayout extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};
  setStatePromise = setStatePromise.bind(this);
  pollParticipantDataTimer = 0;
  audioPlayList: string[] = [];
  spGenshinLaunchingAudioPlayRange = [];
  spGenshinLaunchingAudioPlayer: Howl | null = null;
  spGenshinLaunchingAudioLoaded = false;
  spGenshinLaunchingAudioPlayaing = false;
  spGenshinEnteredAudioPlayer: Howl | null = null;

  _oldTheme: ISettingsTheme = 'auto';

  get isGenshin() {
    return this.props?.detail?.spConfig?.preset === 'genshin';
  }

  constructor(props) {
    super(props);
    this.state = {
      currentTime: Date.now() - ((window as any)._t_diff || 0),
      progressTimer: 0,
      audioUrl: '',
      audioPlaying: false,
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
    if (newTimeStatus === 'Pending') {
      if (this.isTimeToPlayGenshinLaunchAudio()) {
        this.playGenshinLaunchingAudio();
      }
    }
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
      if (this.isGenshin) {
        this.spGenshinEnteredAudioPlayer?.play();
      }
    }
  };

  pollParticipantDataInBackground = (props?: Props) => {
    const p = props || this.props;
    const { id, session, detail, dispatch } = p;
    console.log('[pollParticipantData] check whether to polling participant data');
    if (session?.user?.role !== ECompetitionUserRole.participant) {
      console.log('[pollParticipantData] wrong role, skipped');
      return;
    }
    const { currentTime } = this.state;
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    if (timeStatus === 'Running' || (timeStatus === 'Ended' && currentTime - endTime < 1000)) {
      console.log('[pollParticipantData] polling participant data');
      dispatch({
        type: 'competitions/getNotifications',
        payload: { id, auto: true },
      });
      dispatch({
        type: 'competitions/getQuestions',
        payload: { id, auto: true },
      });
    } else {
      console.log('[pollParticipantData] not in running time, skipped');
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
    dispatch({
      type: 'competitions/getSettings',
      payload: { id },
    });
    if (session?.loggedIn) {
      // dispatch({
      //   type: 'competitions/getProblems',
      //   payload: { id },
      // });
    }
    const progressTimer: any = setInterval(this.updateProgress, 1000);
    this.setState({ progressTimer });
    this.checkDetail(this.props.detail);
    competitionEmitter.on(
      CompetitionEvents.SpGenshinSectionUnlocked,
      this.onSpGenshinSectionUnlocked,
    );
    if (
      this.props.session?.loggedIn &&
      this.props.session.user?.role === ECompetitionUserRole.participant
    ) {
      console.log('[pollParticipantData] start');
      this.pollParticipantDataInBackground(this.props);
      this.pollParticipantDataTimer = window.setInterval(
        () => this.pollParticipantDataInBackground(),
        30 * 1000,
      );
    }
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
      console.log('session', nextProps.session);
      if (nextProps.session.user?.role === ECompetitionUserRole.participant) {
        console.log('[pollParticipantData] start');
        this.pollParticipantDataInBackground(nextProps);
        clearInterval(this.pollParticipantDataTimer);
        this.pollParticipantDataTimer = window.setInterval(
          () => this.pollParticipantDataInBackground(),
          30 * 1000,
        );
      }
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
      clearInterval(this.pollParticipantDataTimer);
      router.replace(urlf(pages.competitions.home, { param: { id } }));
    }

    if (this.props.detail !== nextProps.detail) {
      this.checkDetail(nextProps.detail);
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.progressTimer);
    clearInterval(this.pollParticipantDataTimer);
    this.uninstallGenshinTheme();
    competitionEmitter.off(
      CompetitionEvents.SpGenshinSectionUnlocked,
      this.onSpGenshinSectionUnlocked,
    );
    this.spGenshinLaunchingAudioPlayer?.unload();
    this.spGenshinEnteredAudioPlayer?.unload();
  }

  checkDetail = (detail?: ICompetition) => {
    const spConfig = detail?.spConfig || {};
    if (spConfig.preset === 'genshin') {
      this.installGenshinTheme();
      if (!this.spGenshinLaunchingAudioPlayer) {
        this.spGenshinLaunchingAudioPlayer = new Howl({
          src: [staticUrls.resources.spGenshinLaunchMusic],
          preload: true,
        });
        this.spGenshinLaunchingAudioPlayer.once('load', this.handleLaunchingAudioLoaded);
      }
      if (!this.spGenshinEnteredAudioPlayer) {
        this.spGenshinEnteredAudioPlayer = new Howl({
          src: [staticUrls.resources.spGenshinLaunchDoorOpenAudio],
          preload: true,
        });
      }
    } else {
      this.uninstallGenshinTheme();
    }
  };

  installGenshinTheme = () => {
    document.body.classList.add('genshin-theme');
    this._oldTheme = this.props.settingsTheme;
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme: 'light', isTemp: true },
    });
    this.props.dispatch({
      type: 'settings/setThemeLocked',
      payload: { themeLocked: true },
    });
    console.log('Genshin, start!');
  };

  uninstallGenshinTheme = () => {
    document.body.classList.remove('genshin-theme');
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme: this._oldTheme },
    });
    this.props.dispatch({
      type: 'settings/setThemeLocked',
      payload: { themeLocked: false },
    });
  };

  isTimeToPlayGenshinLaunchAudio = () => {
    if (!this.isGenshin) {
      return;
    }

    const currentTime = this.state.currentTime;
    const startTime = toLongTs(this.props.detail.startAt);
    const timeElapsedSecs = Math.floor((currentTime - startTime) / 1000);
    const audioDuration = SP_GENSHIN_LAUNCHING_AUDIO_DURATION;
    const startPlayAt = -audioDuration + SP_GENSHIN_LAUNCHING_AUDIO_PLAY_OFFSET;
    return timeElapsedSecs >= startPlayAt && timeElapsedSecs < startPlayAt + audioDuration;
  }

  playGenshinLaunchingAudio = () => {
    if (!this.isGenshin) {
      return;
    }
    if (!this.spGenshinLaunchingAudioPlayer) {
      return;
    }
    if (this.spGenshinLaunchingAudioPlayaing || !this.spGenshinLaunchingAudioLoaded) {
      return;
    }
    const currentTime = this.state.currentTime;
    const startTime = toLongTs(this.props.detail.startAt);
    const timeElapsedSecs = Math.floor((currentTime - startTime) / 1000);
    const audioDuration = SP_GENSHIN_LAUNCHING_AUDIO_DURATION;
    const startPlayAt = -audioDuration + SP_GENSHIN_LAUNCHING_AUDIO_PLAY_OFFSET;

    if (!this.isTimeToPlayGenshinLaunchAudio()) {
      console.log(
        '[playGenshinLaunchingAudio] not in proper progress, skipped',
        timeElapsedSecs,
        [startPlayAt, startPlayAt + audioDuration],
      );
      return;
    }

    const playSeekAt = Math.min(audioDuration, timeElapsedSecs - startPlayAt);
    if (playSeekAt < audioDuration) {
      playSeekAt > 1 && this.spGenshinLaunchingAudioPlayer.seek(playSeekAt);
      this.spGenshinLaunchingAudioPlayer.play();
    }
    this.spGenshinLaunchingAudioPlayaing = true;
    console.log('[playGenshinLaunchingAudio] play at', playSeekAt, {
      timeElapsedSecs,
      startPlayAt,
      audioDuration,
    });
  };

  handleLaunchingAudioLoaded = () => {
    console.log('[handleLaunchingAudioLoaded]');
    this.spGenshinLaunchingAudioLoaded = true;
    this.playGenshinLaunchingAudio();
  };

  onSpGenshinSectionUnlocked = (
    data: ICompetitionEvenData[CompetitionEvents.SpGenshinSectionUnlocked],
  ) => {
    console.log('[event.onSpGenshinSectionUnlocked]', data);
    const toUseUrl = pickGenshinAudioUrlFromConf(data.section?.onUnlock?.playAudio);
    if (toUseUrl) {
      console.log('[event.onSpGenshinSectionUnlocked] play url:', toUseUrl);
      this.audioPlayList.push(toUseUrl);
      if (this.audioPlayList.length === 1) {
        this.setState({
          audioUrl: this.audioPlayList[0],
        });
      }
      console.log('new play list', this.audioPlayList);
    }
  };

  handleAudioReady = () => {
    if (
      // @ts-ignore
      ('userActivation' in navigator && navigator.userActivation.hasBeenActive) ||
      // @ts-ignore
      window._userHasBeenActive
    ) {
      this.playAudio();
    } else {
      userActiveEmitter.on(UserActiveEvents.UserHasBeenActive, this.playAudio);
    }
  };

  handleAudioEnded = () => {
    this.audioPlayList.shift();
    if (this.audioPlayList.length > 0) {
      this.setState({
        audioUrl: this.audioPlayList[0],
      });
      console.log('play next audio', this.audioPlayList[0]);
    } else {
      this.setState({
        audioUrl: '',
      });
      console.log('no more audio to play');
    }
  };

  playAudio = () => {
    this.setState({
      audioPlaying: true,
    });
  };

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
        {!!this.state.audioUrl && (
          <ReactPlayer
            url={this.state.audioUrl}
            playing={this.state.audioPlaying}
            onReady={this.handleAudioReady}
            onError={console.error}
            onEnded={this.handleAudioEnded}
            style={{ display: 'none' }}
          />
        )}
      </ContestTimeStatusWatcher>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    settingsTheme: state.settings.theme,
    loading:
      !state.competitions.session[id] ||
      !!state.loading.effects['competitions/getSession'] ||
      !!state.loading.effects['competitions/getDetail'] ||
      !!state.loading.effects['competitions/getSettings'],
    session: state.competitions.session[id],
    detail: state.competitions.detail[id],
  };
}

export default connect(mapStateToProps)(CompetitionLayout);
