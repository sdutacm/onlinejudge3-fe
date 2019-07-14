import React from 'react';
import { Popover } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import { numberToAlphabet, urlf } from '@/utils/format';
import { withRouter } from 'react-router';
import { RouteProps } from '@/@types/props';

export interface Props extends RouteProps {
  problem: IProblem | IProblemLite;
  contestId?: IContest['contestId'];
  index?: number;
}

const ProblemBar: React.FC<Props> = ({ problem, contestId, index, location }) => {
  const problemDetailUrl = contestId
    ? urlf(pages.contests.problemDetail, { param: { id: contestId, index: numberToAlphabet(index) } })
    : urlf(pages.problems.detail, { param: { id: problem.problemId }, query: { from: location.query.from } });
  return (
    <Popover content={problem.title}>
      <Link to={problemDetailUrl} onClick={e => e.stopPropagation()} className="no-wrap">
        {contestId ? numberToAlphabet(index) : problem.problemId}
      </Link>
    </Popover>
  );
};

export default withRouter(ProblemBar);
