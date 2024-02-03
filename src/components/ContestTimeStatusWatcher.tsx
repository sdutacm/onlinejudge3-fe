import React from 'react';
import { notification } from 'antd';
import tracker from '@/utils/tracker';
import { ContestTimeStatus } from '@/utils/getSetTimeStatus';
import { Howl } from 'howler';

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
          // TODO remove later
          const sound = new Howl({
            src: ['https://cdn.sdutacm.cn/oj/dist/public/AzurSeries/assets/ASR2_Audio_Paimon_Ended.mp3'],
          })
          sound.play();
          break;
      }
    }
  }

  render() {
    return this.props.children;
  }
}

export default ContestTimeStatusWatcher;
