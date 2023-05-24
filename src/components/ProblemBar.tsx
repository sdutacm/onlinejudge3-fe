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
  competitionId?: number;
  index?: number;
  display?: 'id' | 'title' | 'id-title';
  disableJump?: boolean;
}

const ProblemBar: React.FC<Props> = ({ problem, contestId, competitionId, index, display = 'id', disableJump = false, location }) => {
  if (!problem) {
    return <span>--</span>;
  }
  const problemDetailUrl = contestId
    ? urlf(pages.contests.problemDetail, { param: { id: contestId, index: numberToAlphabet(index) } })
    : competitionId
    ? urlf(pages.competitions.problemDetail, { param: { id: competitionId, index: numberToAlphabet(index) } })
    : urlf(pages.problems.detail, { param: { id: problem.problemId }, query: { from: location.query.from } });
  const id = contestId || competitionId ? numberToAlphabet(index) : `${problem.problemId}`;
  const title = problem.title;
  let displayText = '';
  switch (display) {
    case 'id':
      displayText = id;
      break;
    case 'title':
      displayText = title;
      break;
    case 'id-title':
      displayText = `${id} - ${title}`;
      break;
  }
  const inner = disableJump ?
    <a>{displayText}</a> :
    <Link to={problemDetailUrl} onClick={e => e.stopPropagation()} className="no-wrap">
      {displayText}
    </Link>;
  if (!problem.title) {
    return inner;
  }
  if (display === 'id') {
    return <Popover content={problem.title}>
      {inner}
    </Popover>;
  }
  return inner;
};

export default withRouter(ProblemBar);
