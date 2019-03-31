import React from 'react';

export interface Props {
  secs: number;
  renderTime: (secs: number) => React.ReactNode;
  handleRequestTimeSync?: () => any;
  timeSyncInterval?: number;
}

interface State {
  secs: number;
  timer: number;
  requestSyncTimer: number;
}

class Countdown extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      secs: Math.max(props.secs, 0),
      timer: 0,
      requestSyncTimer: 0,
    };
  }

  componentDidMount(): void {
    if (this.state.secs <= 0) {
      return;
    }
    const { handleRequestTimeSync, timeSyncInterval } = this.props;
    this.setState({
      timer: setInterval(this.updateTime, 1000) as any,
    });
    if (typeof handleRequestTimeSync === 'function' && timeSyncInterval) {
      this.setState({
        requestSyncTimer: setInterval(this.syncTime, timeSyncInterval) as any,
      });
    }
  }

  componentWillUnmount(): void {
    this.clearTimers();
  }

  updateTime = () => {
    const { secs } = this.state;
    if (secs <= 0) {
      this.clearTimers();
      return;
    }
    this.setState({ secs: secs - 1 });
  };

  syncTime = () => {
    this.setState({
      secs: this.props.handleRequestTimeSync(),
    });
  };

  clearTimers = () => {
    clearInterval(this.state.timer);
    clearInterval(this.state.requestSyncTimer);
  };

  render() {
    return this.props.renderTime(this.state.secs);
  }
}

export default Countdown;
