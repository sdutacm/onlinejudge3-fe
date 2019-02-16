import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import ProblemDetailPage from '@/components/ProblemDetailPage';
import PageLoading from '@/components/PageLoading';
import { alphabetToNumber } from '@/utils/format';

interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problemsLoading: boolean;
  problems: IFullList<IProblem>;
  favorites: IFullList<IFavorite>;
}

interface State {
}

class ContestProblem extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  // checkDetail = (detail: IContest) => {
  //   const { id, dispatch } = this.props;
  //   if (!detail) {
  //     return;
  //   }
  //   const currentTime = Date.now() - ((window as any)._t_diff || 0);
  //   const timeStatus = getSetTimeStatus(toLongTs(detail.startAt), toLongTs(detail.endAt), currentTime);
  //   if (timeStatus !== 'Pending') { // 比赛已开始，可以去获取其他数据
  //     dispatch({
  //       type: 'contests/getProblems',
  //       payload: { id, force: true },
  //     });
  //   }
  // };

  // componentDidMount(): void {
  //   window.scrollTo(0, 0);
  // }

  render() {
    const {
      id,
      session,
      detailLoading,
      detail,
      problemsLoading,
      problems: { rows },
      match,
      favorites,
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <PageLoading />;
    }
    const index = alphabetToNumber(match.params.index);
    const problem = (rows && rows[index]) || {} as IProblem;
    return <ProblemDetailPage loading={problemsLoading}
                              data={problem}
                              session={session}
                              contestId={id}
                              problemIndex={index}
                              favorites={favorites.rows}
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
    favorites: state.favorites.list,
  };
}

export default connect(mapStateToProps)(ContestProblem);
