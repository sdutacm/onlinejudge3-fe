import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Button, Progress } from 'antd';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import constants from '@/configs/constants';
import Ranklist from '@/components/Ranklist';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import { toLongTs } from '@/utils/format';
import moment from 'moment';
import UserBar from '@/components/UserBar';
import { ContestTypes } from '@/configs/contestTypes';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import PageAnimation from '@/components/PageAnimation';
import { ContestModes } from '@/configs/contestModes';
import { checkPerms } from '@/utils/permission';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import { ContestRatingStatus, contestRatingStatusMap } from '@/configs/contestRatingStatus';
import { EPerm } from '@/common/configs/perm.config';
import router from 'umi/router';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  globalSession: ISessionStatus;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problemsLoading: boolean;
  problems: IFullList<IProblem>;
  ranklistLoading: boolean;
  ranklist: IFullList<IRanklistRow>;
  ratingStatus: IContestRatingStatus;
}

interface State {}

class ContestRanklist extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};
  private _ratingStatusRefreshTimer: number;

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkDetail = (detail: IContest) => {
    const { id, session, dispatch } = this.props;
    // console.log('check', detail);
    if (!detail) {
      return;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    dispatch({
      type: 'contests/getRanklist',
      payload: { id, god: ['true', '1'].includes(this.props.location.query.god) },
      force: true,
    });
  };

  componentDidMount(): void {
    this.checkDetail(this.props.detail);
    this.refreshRatingStatus(true);
    // @ts-ignore
    this._ratingStatusRefreshTimer = setInterval(
      this.refreshRatingStatus,
      constants.ratingStatusUpdateInterval,
    );
  }

  componentWillUnmount(): void {
    clearInterval(this._ratingStatusRefreshTimer);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!this.props.detail && nextProps.detail) {
      this.checkDetail(nextProps.detail);
    }
  }

  refreshRanklist = (god?: boolean) => {
    // console.log('refreshRank');
    this.props.dispatch({
      type: 'contests/getRanklist',
      payload: {
        id: this.props.id,
        god: typeof god === 'boolean' ? god : ['true', '1'].includes(this.props.location.query.god),
        force: true,
      },
    });
  };

  refreshRatingStatus = (isFirstRequest = false) => {
    const { id, detail, dispatch } = this.props;
    if (detail && detail.mode === ContestModes.Rating && detail.ended) {
      return dispatch({
        type: 'contests/getRatingStatus',
        payload: { id },
      }).then((ret) => {
        if (ret.success) {
          if (ret.data.status === ContestRatingStatus.DONE) {
            clearInterval(this._ratingStatusRefreshTimer);
            if (!isFirstRequest) {
              dispatch({
                type: 'contests/getRanklist',
                payload: {
                  id,
                  god: ['true', '1'].includes(this.props.location.query.god),
                  force: true,
                },
              });
            }
          }
          this.setState({
            ratingStatus: ret.data,
          });
        }
      });
    }
  };

  renderRatingProgress = () => {
    if (!this.props.ratingStatus) {
      return null;
    }
    const { status, progress, used } = this.props.ratingStatus;
    const text: string = ((contestRatingStatusMap[status] || {}) as any).name;
    return (
      <div className="mt-lg">
        <Progress
          percent={status === ContestRatingStatus.ERR ? 100 : progress || 0}
          status={status === ContestRatingStatus.ERR ? 'exception' : 'active'}
          showInfo={false}
          className={status === ContestRatingStatus.DONE ? 'display-none' : ''}
        />
        <p className="contest-rating-status text-center">{text}</p>
        {status === ContestRatingStatus.DONE && used ? (
          <p className="text-center text-secondary">cost {used}ms by Node.js</p>
        ) : null}
      </div>
    );
    // switch (status) {
    //   case ContestRatingStatus.PD:
    //   case ContestRatingStatus.CAL:
    //     return (
    //       <div className="mt-lg">
    //         <Progress percent={progress || 0} status="active" showInfo={false} />
    //         <p className="contest-rating-status text-center">{text}</p>
    //       </div>
    //     );
    //   case ContestRatingStatus.DONE:
    //     return (
    //       <div className="mt-lg">
    //         <p className="contest-rating-status text-center mb-none">{text}</p>
    //         {used ? <p className="text-center text-secondary">cost {used} ms</p> : null}
    //       </div>
    //     );
    //   case ContestRatingStatus.ERR:
    //     return (
    //       <div className="mt-lg">
    //         <Progress percent={100} status="exception" showInfo={false} />
    //         <p className="contest-rating-status text-center">{text}</p>
    //       </div>
    //     );
    // }
    // return null;
  };

  handleGodViewChange = (god: boolean) => {
    tracker.event({
      category: 'contests',
      action: 'switchGodView',
    });
    setTimeout(() => {
      router.replace({
        pathname: this.props.location.pathname,
        query: { ...this.props.location.query, god: god ? 'true' : undefined },
      });
      this.refreshRanklist(god);
    }, constants.switchAnimationDuration);
  };

  render() {
    const {
      id,
      globalSession,
      session,
      detailLoading,
      detail,
      problems,
      ranklistLoading,
      ranklist: { rows },
      location: { query },
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <PageLoading />;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    const ranklist = rows || ([] as IRanklist);
    const isRating = detail.mode === ContestModes.Rating;
    const canViewGodRanklist = checkPerms(globalSession, EPerm.ContestAccess);

    return (
      <PageAnimation>
        <PageTitle title="Ranklist">
          <Row gutter={16}>
            <Col xs={24}>
              <Card bordered={false} className="ranklist-header">
                <h2 className="text-center">{detail.title}</h2>
                <p className="text-center" style={{ marginBottom: '5px' }}>
                  <span>
                    {moment(startTime).format('YYYY-MM-DD HH:mm')} ~{' '}
                    {moment(endTime).format('YYYY-MM-DD HH:mm')}
                  </span>
                </p>
                {detail.ended && isRating && this.renderRatingProgress()}
              </Card>
              <Card bordered={false} className="list-card">
                <Ranklist
                  id={id}
                  data={ranklist}
                  contest={detail}
                  loading={ranklistLoading}
                  frozenLength={detail.frozenLength}
                  problemNum={problems.count || 0}
                  session={session}
                  userCellRender={(user) => (
                    <UserBar
                      user={user}
                      isContestUser={detail.type === ContestTypes.Register}
                      showRating={isRating}
                    />
                  )}
                  needAutoUpdate={true}
                  handleUpdate={this.refreshRanklist}
                  updateInterval={constants.ranklistUpdateInterval}
                  existedHeaderClassName="ranklist-header"
                  rating={isRating}
                  allowGodView={canViewGodRanklist}
                  godView={!!query.god}
                  handleGodViewChange={this.handleGodViewChange}
                />
              </Card>
            </Col>
          </Row>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    globalSession: state.session,
    session: state.contests.session[id],
    detailLoading: !!state.loading.effects['contests/getDetail'],
    detail: state.contests.detail[id],
    problemsLoading: !!state.loading.effects['contests/getProblems'],
    problems: state.contests.problems[id] || {},
    ranklistLoading: !!state.loading.effects['contests/getRanklist'],
    ranklist: state.contests.ranklist[id] || {},
    ratingStatus: state.contests.ratingStatus[id],
  };
}

export default connect(mapStateToProps)(ContestRanklist);
