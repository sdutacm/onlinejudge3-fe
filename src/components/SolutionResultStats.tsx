import React from 'react';
import { Link } from 'react-router-dom';
import { Popover, Progress } from 'antd';
import { formatPercentage } from '@/utils/format';
import shortNumber from 'short-number';

interface Props {
  accepted: number;
  submitted: number;
  toSolutionsLink: string;
}

const SolutionResultStats: React.StatelessComponent<Props> = ({ accepted, submitted, toSolutionsLink }) => (
  <Popover title="AC / Total"
           content={`${accepted} / ${submitted} (${formatPercentage(accepted, submitted)})`}>
    <Link to={toSolutionsLink}
          onClick={e => e.stopPropagation()}
    >
      <Progress className="mini-ratio-progress"
                type="circle"
                percent={accepted / submitted * 100 || 0}
                width={12}
                strokeWidth={12}
                showInfo={false}
      />
      <span className="ml-sm-md">{shortNumber(accepted)}</span>
    </Link>
  </Popover>
);

export default SolutionResultStats;
