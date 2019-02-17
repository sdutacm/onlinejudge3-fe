import React from 'react';
import { connect } from 'dva';
import { Popover } from 'antd';
import { Results, resultsMap } from '@/configs/results';

interface Props {
  percent: number;
  timeLimit: number;
  result: number;
  colorSettings: ISettingsColor;
}

interface State {
  percent: number;
  timer: number;
  updateCnt: number;
  updateItv: number;
  lockAnim: boolean;
}

function isFinished(result) {
  return result !== Results.WT && result !== Results.JG;
}

class ResultBar extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    percent: 0,
    timeLimit: 1000,
    result: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      percent: props.percent,
      timer: 0,
      updateCnt: 0,
      updateItv: 500,
      lockAnim: false,
    };
  }

  updateProgress = () => {
    // console.log('upd progress');
    const r = this.props.timeLimit / 1000;
    const d = Math.log(this.state.updateCnt / Math.pow(r, 1.75) + 3) - Math.log(this.state.updateCnt / Math.pow(r, 1.75) + 2);
    const x = d / 0.01352 / Math.pow(r, 0.86283);
    // console.log(d, x, this.state.percent + x);
    const maxPercent = 90;
    const nextPercent = Math.min(this.state.percent + x, maxPercent);
    this.setState({
      percent: nextPercent,
      updateCnt: this.state.updateCnt + 1,
    });
    if (nextPercent >= maxPercent) {
      clearInterval(this.state.timer);
    }
  };

  componentDidMount() {
    const { result } = this.props;
    if (!isFinished(result)) {
      setTimeout(() => {
        const timer: any = setInterval(this.updateProgress, this.state.updateItv);
        this.setState({ timer });
      }, 250 + Math.random() * 500);
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (this.props.result !== nextProps.result && isFinished(nextProps.result)) {
      // console.log('judged!');
      clearInterval(this.state.timer);
      if (resultsMap[nextProps.result].shortName === 'AC') {
        this.setState({ percent: 100, lockAnim: true });
        setTimeout(() => this.setState({ lockAnim: false }), 400);
      }
      else {
        this.setState({ lockAnim: false });
      }
    }
  }

  render() {
    const { result, colorSettings } = this.props;
    if (!isFinished(result) || this.state.lockAnim) {
      return <div className="progress" style={{ width: this.state.percent + '%' }}>&nbsp;</div>;
    }
    return (
      <Popover title={resultsMap[result].fullName} content={resultsMap[result].description}>
        <div className={`result bg-${colorSettings === 'colorful' ? resultsMap[result].colorfulColor : resultsMap[result].normalColor}`}>
          <span>{resultsMap[result].shortName}</span>
        </div>
      </Popover>
    );
  }
}

function mapStateToProps(state) {
  return {
    colorSettings: state.settings.color,
  };
}

export default connect(mapStateToProps)(ResultBar);
