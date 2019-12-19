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
  display?: 'id' | 'title' | 'id-title';
}

const ProblemBar: React.FC<Props> = ({ problem, contestId, index, display = 'id', location }) => {
  if (!problem) {
    return <span>--</span>;
  }
  const problemDetailUrl = contestId
    ? urlf(pages.contests.problemDetail, { param: { id: contestId, index: numberToAlphabet(index) } })
    : urlf(pages.problems.detail, { param: { id: problem.problemId }, query: { from: location.query.from } });
  const id = contestId ? numberToAlphabet(index) : `${problem.problemId}`;
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
  const link = <Link to={problemDetailUrl} onClick={e => e.stopPropagation()} className="no-wrap">
    {displayText}
  </Link>;
  if (display === 'id') {
    return <Popover content={problem.title}>
      {link}
    </Popover>;
  }
  return link;
};

export default withRouter(ProblemBar);
