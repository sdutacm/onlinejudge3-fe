import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import { toLongTs } from '@/utils/format';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import constants from '@/configs/constants';
import gStyles from '@/general.less';
import { isEqual } from 'lodash';
import SolutionDetailPage from '@/components/SolutionDetailPage';

interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problems: FullList<IProblem>;
  data: ISolution;
}

interface State {
}

class ContestSolutionDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkDetail = (detail: IContest) => {
    const { id, dispatch } = this.props;
    if (!detail) {
      return;
    }
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const timeStatus = getSetTimeStatus(toLongTs(detail.startAt), toLongTs(detail.endAt), currentTime);
    if (timeStatus !== 'Pending') { // 比赛已开始，可以去获取其他数据
      dispatch({
        type: 'contests/getProblems',
        payload: { id },
      });
    }
  };

  checkSolutionDetail = (sid) => {
    this.props.dispatch({
      type: 'solutions/getDetail',
      payload: ~~sid,
    })
  };

  componentDidMount(): void {
    this.checkDetail(this.props.detail);
    this.checkSolutionDetail(this.props.match.params.sid);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!this.props.detail && nextProps.detail) {
      this.checkDetail(nextProps.detail);
    }
    if (!isEqual(this.props.match.params, nextProps.match.params)) {
      this.checkSolutionDetail(nextProps.match.params.sid);
    }
  }

  render() {
    const {
      id,
      session,
      detailLoading,
      detail,
      problems: { rows: problemRows },
      loading,
      data: allData,
      dispatch,
      match,
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <Spin delay={constants.indicatorDisplayDelay} className={gStyles.spin} />;
    }
    const problemList = (problemRows || []).map((problem, index) => ({
      problemId: problem.problemId,
      title: problem.title,
      timeLimit: problem.timeLimit,
      index,
    }));
    const sid = ~~match.params.sid;
    const data = allData[sid] || {} as ISolution;
    return <SolutionDetailPage loading={loading} data={data} session={session} dispatch={dispatch}
                               contestId={id} problemList={problemList} />;
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
    loading: !!state.loading.effects['solutions/getDetail'],
    data: state.solutions.detail,
  };
}

export default connect(mapStateToProps)(ContestSolutionDetail);
