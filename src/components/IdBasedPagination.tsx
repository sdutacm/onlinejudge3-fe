import React from 'react';
import { Icon } from 'antd';
import classNames from 'classnames';

export interface Props {
  hasPrev: boolean;
  hasNext: boolean;
  onGoPrev?: () => any;
  onGoNext?: () => any;
}

interface State {}

class IdBasedPagination extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { hasPrev, hasNext, onGoPrev, onGoNext } = this.props;
    return (
      <ul className="ant-pagination ant-table-pagination" unselectable="on">
        <li
          title="Previous Page"
          className={classNames('ant-pagination-prev', {
            'ant-pagination-disabled': !hasPrev,
          })}
          aria-disabled={!hasPrev}
        >
          <a className="ant-pagination-item-link" onClick={(hasPrev && onGoPrev) || (() => {})}>
            <Icon type="left" />
          </a>
        </li>
        <li
          title="Next Page"
          className={classNames('ant-pagination-next', {
            'ant-pagination-disabled': !hasNext,
          })}
          aria-disabled={!hasNext}
        >
          <a className="ant-pagination-item-link" onClick={(hasNext && onGoNext) || (() => {})}>
            <Icon type="right" />
          </a>
        </li>
      </ul>
    );
  }
}

export default IdBasedPagination;
