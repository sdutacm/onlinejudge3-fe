import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import { isEqual } from 'lodash';
import SolutionDetailPage from '@/components/SolutionDetailPage';
import PageLoading from '@/components/PageLoading';

interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problems: FullList<IProblem>;
  data: ISolution;
  changeSharedLoading: boolean;
}

interface State {
}

class ContestSolutionDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  checkSolutionDetail = (props: Props) => {
    // 由于 DOM 结构问题，可能导致多次 unmount -> mount，所以由 componentDidMount 执行此函数可能发出多次重复请求
    if (!props.detail) {
      return;
    }
    props.dispatch({
      type: 'solutions/getDetail',
      payload: ~~props.match.params.sid,
    })
  };

  componentDidMount(): void {
    this.checkSolutionDetail(this.props);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    // 临时措施，获取到 detail 后补一次请求
    if (!this.props.detail && nextProps.detail) {
      this.checkSolutionDetail(nextProps);
    }
    if (!isEqual(this.props.match.params, nextProps.match.params)) {
      this.checkSolutionDetail(nextProps);
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
      changeSharedLoading,
      dispatch,
      match,
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <PageLoading />;
    }
    const problemList = (problemRows || []).map((problem, index) => ({
      problemId: problem.problemId,
      title: problem.title,
      timeLimit: problem.timeLimit,
      index,
    }));
    const sid = ~~match.params.sid;
    const data = allData[sid] || {} as ISolution;
    return <SolutionDetailPage loading={loading} data={data} session={session} changeSharedLoading={changeSharedLoading}
                               dispatch={dispatch} contestId={id} problemList={problemList}
    />;
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
    changeSharedLoading: !!state.loading.effects['solutions/changeShared'],
  };
}

export default connect(mapStateToProps)(ContestSolutionDetail);
