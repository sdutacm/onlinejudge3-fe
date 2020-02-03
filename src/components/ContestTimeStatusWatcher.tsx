import React from 'react';
import { notification } from 'antd';
import tracker from '@/utils/tracker';
import { ContestTimeStatus } from '@/utils/getSetTimeStatus';

export interface Props {
  contestId: number;
  timeStatus: ContestTimeStatus;
}

interface State {
}

class ContestTimeStatusWatcher extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if (p.contestId === np.contestId && p.timeStatus !== np.timeStatus) {
      switch (np.timeStatus) {
        case 'Ended':
          notification.success({
            message: 'Contest Ended',
            duration: 0,
          });
          break;
      }
    }
  }

  render() {
    return this.props.children;
  }
}

export default ContestTimeStatusWatcher;
