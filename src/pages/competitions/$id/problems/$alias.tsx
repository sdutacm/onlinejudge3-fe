import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import ProblemDetailPage from '@/components/ProblemDetailPage';
import PageLoading from '@/components/PageLoading';
import { alphabetToNumber, toLongTs } from '@/utils/format';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import { ICompetition } from '@/common/interfaces/competition';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: ICompetition;
  problemsLoading: boolean;
  problems: IFullList<IProblem>;
}

interface State {}

class CompetitionProblem extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  // checkDetail = (detail: ICompetition) => {
  //   const { id, dispatch } = this.props;
  //   if (!detail) {
  //     return;
  //   }
  //   const currentTime = Date.now() - ((window as any)._t_diff || 0);
  //   const timeStatus = getSetTimeStatus(toLongTs(detail.startAt), toLongTs(detail.endAt), currentTime);
  //   if (timeStatus !== 'Pending') { // 比赛已开始，可以去获取其他数据
  //     dispatch({
  //       type: 'competitions/getProblems',
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
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <PageLoading />;
    }

    const aliasOrIndex = match.params.alias;
    const matchedProblemByAliasIndex = rows?.findIndex((item) => item.alias === aliasOrIndex);
    let alias = '';
    let index = -1;
    if (matchedProblemByAliasIndex > -1) {
      alias = aliasOrIndex;
      index = matchedProblemByAliasIndex;
    } else {
      index = alphabetToNumber(match.params.alias);
    }

    const problem = rows?.[index] || ({} as IProblem);
    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const timeStatus = getSetTimeStatus(
      toLongTs(detail.startAt),
      toLongTs(detail.endAt),
      currentTime,
    );
    return (
      <ProblemDetailPage
        loading={problemsLoading}
        data={problem}
        session={session}
        competitionId={id}
        contestTimeStatus={timeStatus}
        problemIndex={index}
        problemAlias={alias}
        favorites={[]}
      />
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    session: state.competitions.session[id],
    detailLoading: state.loading.effects['competitions/getDetail'],
    detail: state.competitions.detail[id],
    problemsLoading: state.loading.effects['competitions/getProblems'],
    problems: state.competitions.problems[id] || {},
  };
}

export default connect(mapStateToProps)(CompetitionProblem);
