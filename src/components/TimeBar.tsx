import React from 'react';
import moment from 'moment';
import { Popover } from 'antd';

export interface Props {
  time: number;
}

interface State {
  timer: number;
  updateItv: number;
}

class TimeBar extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      updateItv: 60 * 1000,
    };
  }

  componentDidMount() {
    const timer: any = setTimeout(() => {
      const timer: any = setInterval(() => this.forceUpdate(), this.state.updateItv);
      this.setState({ timer });
    }, 5000 + Math.random() * this.state.updateItv);
    this.setState({ timer });
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  render() {
    const { time } = this.props;
    return (
      <Popover content={moment(time).format('YYYY-MM-DD HH:mm:ss Z')}>
        <span>{moment(time).fromNow()}</span>
      </Popover>
    );
  }
}

export default TimeBar;
