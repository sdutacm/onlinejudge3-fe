import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Spin, Row, Col, Card } from 'antd';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import constants from '@/configs/constants';
import gStyles from '@/general.less';
import Ranklist from '@/components/Ranklist';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import { toLongTs } from '@/utils/format';
import moment from 'moment';
import UserBar from '@/components/UserBar';
import { ContestTypes } from '@/configs/contestTypes';

interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problemsLoading: boolean;
  problems: FullList<IProblem>;
  ranklistLoading: boolean;
  ranklist: FullList<IRanklistRow>;
}

interface State {
}

class ContestRanklist extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

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
    const timeStatus = getSetTimeStatus(toLongTs(detail.startAt), toLongTs(detail.endAt), currentTime);
    dispatch({
      type: 'contests/getProblems',
      payload: { id },
    });
    dispatch({
      type: 'contests/getRanklist',
      payload: { id },
    })
  };

  componentDidMount(): void {
    this.checkDetail(this.props.detail);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!this.props.detail && nextProps.detail) {
      this.checkDetail(nextProps.detail);
    }
  }

  refreshRanklist = () => {
    console.log('refreshRank');
    this.props.dispatch({
      type: 'contests/getRanklist',
      payload: { id: this.props.id },
    })
  };

  render() {
    const {
      id,
      session,
      detailLoading,
      detail,
      problemsLoading,
      problems,
      ranklistLoading,
      ranklist: { rows },
      match,
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <Spin delay={constants.indicatorDisplayDelay} className={gStyles.spin} />;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    const ranklist = rows || [] as IRanklist;
    return (
      <Row gutter={16}>
        <Col xs={24}>
          <Card bordered={false} className="ranklist-header">
            <h2 className="text-center">{detail.title}</h2>
            <p className="text-center" style={{ marginBottom: '5px' }}>
              <span>{moment(startTime).format('YYYY-MM-DD HH:mm')} ~ {moment(endTime).format('YYYY-MM-DD HH:mm')}</span>
            </p>
          </Card>
          <Card bordered={false} className="list-card">
            <Ranklist data={ranklist}
                      loading={ranklistLoading}
                      problemNum={problems.count || 0}
                      userCellRender={user => <UserBar user={user} isContestUser={detail.type === ContestTypes.Register}/>}
                      needAutoUpdate={timeStatus === 'Running' && detail.category !== 1}
                      handleUpdate={this.refreshRanklist}
                      updateInterval={constants.ranklistUpdateInterval}
                      existedHeaderClassName="ranklist-header"
            />
          </Card>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    session: state.contests.session[id],
    detailLoading: state.loading.effects['contests/getDetail'],
    detail: state.contests.detail[id],
    problemsLoading: state.loading.effects['contests/getProblems'],
    problems: state.contests.problems[id] || {},
    ranklistLoading: state.loading.effects['contests/getRanklist'],
    ranklist: state.contests.ranklist[id] || {},
  };
}

export default connect(mapStateToProps)(ContestRanklist);
