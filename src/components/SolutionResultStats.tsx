import React from 'react';
import { Link } from 'react-router-dom';
import { Popover, Progress } from 'antd';
import { formatPercentage } from '@/utils/format';
import shortNumber from 'short-number';
import tracker from '@/utils/tracker';

export interface Props {
  accepted: number;
  submitted: number;
  toSolutionsLink?: string;
}

const SolutionResultStats: React.FC<Props> = ({ accepted, submitted, toSolutionsLink }) => {
  const inner = (
    <>
      <Progress
        className="mini-ratio-progress stats-progress"
        type="circle"
        percent={accepted / submitted * 100 || 0}
        width={12}
        strokeWidth={12}
        showInfo={false}
      />
      <span className="ml-sm-md">{shortNumber(accepted)}</span>
    </>
  );
  return (
    <Popover
      title="WA / Total"
      content={`${accepted} / ${submitted} (${formatPercentage(accepted, submitted)})`}
      onVisibleChange={(visible) => {
        if (visible) {
          tracker.event({
            category: 'component.SolutionResultStats',
            action: 'showPopover',
          });
        }
      }}
    >
      {toSolutionsLink ?
        <Link to={toSolutionsLink} onClick={e => e.stopPropagation()}>{inner}</Link> :
        <a>{inner}</a>}
    </Popover>
  );
}

export default SolutionResultStats;
