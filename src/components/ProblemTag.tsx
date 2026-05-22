import React from 'react';
import { Popover, Tag } from 'antd';
import AiCornerBadge from '@/components/AiCornerBadge';
import AiGeneratedInfo from '@/components/AiGeneratedInfo';

export interface ProblemTagProps {
  tag: ITag;
  color?: string | null;
  className?: string;
}

export interface ProblemTagPopoverProps {
  tag: ITag;
  children: React.ReactElement<any>;
}

export function renderProblemTagPopoverContent(tag: ITag) {
  const title = `${tag.nameEn} / ${tag.nameZhHans} / ${tag.nameZhHant}`;

  if (!tag.isAigc) {
    return title;
  }

  return (
    <div>
      <div>{title}</div>
      <AiGeneratedInfo aiAuthor={tag.aiAuthor} />
    </div>
  );
}

export const ProblemTagPopover: React.FC<ProblemTagPopoverProps> = ({ tag, children }) => (
  <Popover content={renderProblemTagPopoverContent(tag)}>{children}</Popover>
);

const ProblemTag: React.FC<ProblemTagProps> = ({ tag, color, className = '' }) => (
  <span className={`problem-tag-display ${className}`}>
    <Tag color={color || undefined}>{tag.nameEn}</Tag>
    {tag.isAigc && <AiCornerBadge />}
  </span>
);

export default ProblemTag;
