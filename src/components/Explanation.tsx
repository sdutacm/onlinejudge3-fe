import React from 'react';
import { Popover, Icon } from 'antd';

export interface Props {
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Explanation: React.FC<Props> = ({ title, className, style, children }) => (
  <Popover title={title} content={children}>
    <Icon type="question-circle" className={`info-tips ${className}`} style={style} />
  </Popover>
);

export default Explanation;
