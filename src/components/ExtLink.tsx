import React from 'react';
import DocumentTitle from 'react-document-title';
import { formatPageTitle } from '@/utils/format';
import tracker from '@/utils/tracker';

export interface Props {
  href: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}

const ExtLink: React.FC<Props> = ({ href, title, className, style, onClick, children }) => (
  <a
    href={href}
    title={title}
    target="_blank"
    rel="noreferrer noopener"
    className={className}
    style={style}
    onClick={(e) => {
      tracker.event({
        category: 'component.ExtLink',
        action: 'open',
        label: href,
      });
      if (onClick) {
        onClick(e);
      }
    }}
  >{children}</a>
);

export default ExtLink;
