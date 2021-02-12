import React from 'react';
import { connect } from 'dva';
import { Popover, Modal, Row, Col } from 'antd';
import { resultsMap } from '@/configs/results';
import tracker from '@/utils/tracker';
import { isFinishedResult, isRejectedResult, isAcceptedResult } from '@/utils/judger';
import classNames from 'classnames';

export interface Props {
  percent: number;
  timeLimit: number;
  result: number;
  colorSettings: ISettingsColor;
  current?: number;
  total?: number;
  judgeInfo?: ISolutionJudgeInfo;
}

interface State {
  percent: number;
  timer: number;
  updateCnt: number;
  updateItv: number;
  lockAnim: boolean;
  showDetail: boolean;
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
      showDetail: false,
    };
  }

  updateProgress = () => {
    // console.log('upd progress');
    const r = this.props.timeLimit / 1000;
    const d =
      Math.log(this.state.updateCnt / Math.pow(r, 1.75) + 3) -
      Math.log(this.state.updateCnt / Math.pow(r, 1.75) + 2);
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
    if (!isFinishedResult(result)) {
      // setTimeout(() => {
      //   const timer: any = setInterval(this.updateProgress, this.state.updateItv);
      //   this.setState({ timer });
      // }, 250 + Math.random() * 500);
    }
  }

  componentWillUnmount() {
    // clearInterval(this.state.timer);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (this.props.result !== nextProps.result && isFinishedResult(nextProps.result)) {
      // console.log('judged!');
      // clearInterval(this.state.timer);
      const resultInfo = resultsMap[nextProps.result] || {};
      if (resultInfo.shortName === 'AC') {
        this.setState({ percent: 100, lockAnim: true });
        setTimeout(() => this.setState({ lockAnim: false }), 400);
      } else {
        this.setState({ lockAnim: false });
      }
    }
    if (nextProps.percent && this.props.percent !== nextProps.percent) {
      this.setState({
        percent: nextProps.percent,
      });
    }
  }

  handleShowDetailModal = (e) => {
    e?.stopPropagation();
    this.setState({
      showDetail: true,
    });
    tracker.event({
      category: 'component.ResultBar',
      action: 'showDetailModal',
    });
  };

  handleHideDetailModal = (e) => {
    e?.stopPropagation();
    this.setState({
      showDetail: false,
    });
  };

  stopClick = (e) => {
    e?.stopPropagation();
  };

  render() {
    const { result, colorSettings, current, total, judgeInfo } = this.props;
    if (!isFinishedResult(result) || this.state.lockAnim) {
      return (
        <Popover
          title="Judging"
          content={total ? `Running test ${current}/${total}` : 'Ready to run tests'}
        >
          <div className="progress-container">
            <div className="progress" style={{ width: this.state.percent + '%' }}>
              &nbsp;
            </div>
          </div>
        </Popover>
      );
    }
    const resultInfo = resultsMap[result] || {};
    const isRejected = isRejectedResult(result);
    const title =
      isRejected && judgeInfo
        ? `${resultInfo.fullName} on test ${judgeInfo.lastCase}/${judgeInfo.totalCase}`
        : resultInfo.fullName;
    return (
      <Popover
        title={title}
        content={<span onClick={this.stopClick}>{resultInfo.description}</span>}
        onVisibleChange={(visible) => {
          if (visible) {
            tracker.event({
              category: 'component.ResultBar',
              action: 'showPopover',
            });
          }
        }}
      >
        <div
          className={classNames(
            `result bg-${
              colorSettings === 'colorful' ? resultInfo.colorfulColor : resultInfo.normalColor
            }`,
            {
              'cursor-pointer': judgeInfo,
            },
          )}
          onClick={judgeInfo ? this.handleShowDetailModal : () => {}}
        >
          <span>{resultInfo.shortName}</span>
        </div>
        {judgeInfo ? (
          <Modal
            title="Judgement Info"
            visible={this.state.showDetail}
            footer={null}
            onCancel={this.handleHideDetailModal}
            zIndex={1031}
            width={750}
          >
            <div>
              <Row gutter={16}>
                {judgeInfo.detail?.cases.map((j, index) => {
                  return (
                    <Col xs={12} md={4} key={index} style={{ padding: '6px' }}>
                      <div
                        className={isAcceptedResult(j.result) ? 'bg-green' : 'bg-red'}
                        style={{ padding: '6px' }}
                      >
                        <p style={{ margin: 0, position: 'absolute', fontSize: '8px' }}>
                          #{index + 1}
                        </p>
                        <div className="text-center">
                          <p
                            className="text-bold"
                            style={{ fontSize: '16px', marginBottom: '4px' }}
                          >
                            {resultsMap[j.result]?.shortName}
                          </p>
                          <p style={{ fontSize: '12px', marginBottom: 0 }}>{j.time} ms</p>
                          <p style={{ fontSize: '12px' }}>{j.memory} KiB</p>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Modal>
        ) : null}
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
