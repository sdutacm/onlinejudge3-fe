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
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import PageAnimation from '@/components/PageAnimation';
import tracker from '@/utils/tracker';
import { ContestRatingStatus, contestRatingStatusMap } from '@/configs/contestRatingStatus';
import router from 'umi/router';
import { ICompetition, ICompetitionUser } from '@/common/interfaces/competition';
import { ECompetitionUserRole } from '@/common/enums';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  globalSession: ISessionStatus;
  session: ISessionStatus;
  selfUserDetail: ICompetitionUser;
  detailLoading: boolean;
  detail: ICompetition;
  problemsLoading: boolean;
  problems: IFullList<IProblem>;
  ranklistLoading: boolean;
  ranklist: IFullList<IRanklistRow>;
  ratingStatus: IContestRatingStatus;
}

interface State {}

class CompetitionRanklist extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};
  private _ratingStatusRefreshTimer: number;

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkDetail = (detail: ICompetition) => {
    const { id, session, dispatch } = this.props;
    // console.log('check', detail);
    if (!detail) {
      return;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    dispatch({
      type: 'competitions/getRanklist',
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
    this.props.dispatch({
      type: 'competitions/getRanklist',
      payload: {
        id: this.props.id,
        god: typeof god === 'boolean' ? god : ['true', '1'].includes(this.props.location.query.god),
        force: true,
      },
    });
  };

  refreshRatingStatus = (isFirstRequest = false) => {
    const { id, detail, dispatch } = this.props;
    if (detail?.isRating && detail.ended) {
      return dispatch({
        type: 'competitions/getRatingStatus',
        payload: { id },
      }).then((ret) => {
        if (ret.success) {
          if (ret.data.status === ContestRatingStatus.DONE) {
            clearInterval(this._ratingStatusRefreshTimer);
            if (!isFirstRequest) {
              dispatch({
                type: 'competitions/getRanklist',
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
          <p className="text-center text-secondary">cost {used} ms by Node.js</p>
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
      category: 'competitions',
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
      selfUserDetail,
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
    const isRating = detail.isRating;
    const useScore = ['ICPCWithScore'].includes(detail.rule);
    const canViewGodRanklist = [
      ECompetitionUserRole.admin,
      ECompetitionUserRole.principal,
      ECompetitionUserRole.judge,
    ].includes(selfUserDetail?.role);

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
                {!detail.ended && timeStatus === 'Ended' && isRating && (
                  <h4 className="text-center mt-lg">Waiting for managers to confirm results and trigger settlements</h4>
                )}
                {detail.ended && isRating && this.renderRatingProgress()}
              </Card>
              <Card bordered={false} className="list-card">
                <Ranklist
                  id={id}
                  data={ranklist}
                  competition={detail}
                  loading={ranklistLoading}
                  problemNum={problems.count || 0}
                  session={session}
                  userCellRender={(user) => <UserBar user={user} showRating={isRating} />}
                  needAutoUpdate={true}
                  handleUpdate={this.refreshRanklist}
                  updateInterval={constants.ranklistUpdateInterval}
                  existedHeaderClassName="ranklist-header"
                  rating={isRating}
                  allowGodView={canViewGodRanklist}
                  godView={!!query.god}
                  useScore={useScore}
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
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    globalSession: state.session,
    session: state.competitions.session[id],
    selfUserDetail: state.competitions.selfUserDetail[id],
    detailLoading: !!state.loading.effects['competitions/getDetail'],
    detail: state.competitions.detail[id],
    problemsLoading: !!state.loading.effects['competitions/getProblems'],
    problems: state.competitions.problems[id] || {},
    ranklistLoading: !!state.loading.effects['competitions/getRanklist'],
    ranklist: state.competitions.ranklist[id] || {},
    ratingStatus: state.competitions.ratingStatus[id],
  };
}

export default connect(mapStateToProps)(CompetitionRanklist);
