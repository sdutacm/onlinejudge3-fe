import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import { toLongTs } from '@/utils/format';
import constants from '@/configs/constants';
import gStyles from '@/general.less';
import ProblemPage from '@/components/ProblemPage';

interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problemsLoading: boolean;
  problems: FullList<IProblem>;
}

interface State {
}

class ContestProblem extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkDetail = (detail: IContest) => {
    const { id, session, dispatch } = this.props;
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

  componentDidMount(): void {
    window.scrollTo(0, 0);
    this.checkDetail(this.props.detail);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!this.props.detail && nextProps.detail) {
      this.checkDetail(nextProps.detail);
    }
  }

  render() {
    const {
      id,
      session,
      detailLoading,
      detail,
      problemsLoading,
      problems: { rows },
      match,
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <Spin delay={constants.indicatorDisplayDelay} className={gStyles.spin} />;
    }
    const index = ~~match.params.index;
    const problem = (rows && rows[index]) || {} as IProblem;
    return <ProblemPage loading={problemsLoading} data={problem} session={session} contestId={id} problemIndex={index} />;
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
  };
}

export default connect(mapStateToProps)(ContestProblem);
