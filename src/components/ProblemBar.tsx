import React from 'react';
import { Popover } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import { numberToAlphabet, urlf } from '@/utils/format';
import { withRouter } from 'react-router';
import { RouteProps } from '@/@types/props';
import ProblemTitle from './ProblemTitle';

export interface Props extends RouteProps {
  problem: IProblem | IProblemLite;
  contestId?: IContest['contestId'];
  competitionId?: number;
  index?: number;
  alias?: string;
  display?: 'id' | 'title' | 'id-title';
  disableJump?: boolean;
}

const ProblemBar: React.FC<Props> = ({
  problem,
  contestId,
  competitionId,
  index,
  alias,
  display = 'id',
  disableJump = false,
  location,
}) => {
  if (!problem) {
    return <span>--</span>;
  }
  const problemDetailUrl = contestId
    ? urlf(pages.contests.problemDetail, {
        param: { id: contestId, index: numberToAlphabet(index) },
      })
    : competitionId
    ? urlf(pages.competitions.problemDetail, {
        param: { id: competitionId, alias: alias || numberToAlphabet(index) },
      })
    : urlf(pages.problems.detail, {
        param: { id: problem.problemId },
        query: { from: location.query.from },
      });
  const id = alias || (index >= 0 && numberToAlphabet(index)) || `${problem.problemId}`;

  let displayNode: React.ReactNode = '';
  switch (display) {
    case 'id':
      displayNode = id;
      break;
    case 'title':
      displayNode = <ProblemTitle problem={problem} fallback="--" />;
      break;
    case 'id-title':
      displayNode = (
        <span>
          {id} - <ProblemTitle problem={problem} fallback="--" />
        </span>
      );
      break;
  }
  const inner = disableJump ? (
    <a>{displayNode}</a>
  ) : (
    <Link to={problemDetailUrl} onClick={(e) => e.stopPropagation()} className="no-wrap">
      {displayNode}
    </Link>
  );
  if (!problem.title) {
    return inner;
  }
  if (display === 'id') {
    return <Popover content={<ProblemTitle problem={problem} fallback="--" />}>{inner}</Popover>;
  }
  return inner;
};

export default withRouter(ProblemBar);
