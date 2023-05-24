import React from 'react';
import { connect } from 'dva';
import { Popover, Modal, Row, Col } from 'antd';
import { resultsMap } from '@/configs/results';
import tracker from '@/utils/tracker';
import { isFinishedResult, isRejectedResult, isAcceptedResult } from '@/utils/judger';
import classNames from 'classnames';

export interface Props {
  percent: number;
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

  renderJudgeInfoCase = (j: ISolutionJudgeInfoDetailCase, index: number) => {
    return (
      <div
        className={'text-white' + (isAcceptedResult(j.result) ? ' bg-green' : ' bg-red')}
        style={{ padding: '6px' }}
      >
        <p style={{ margin: 0, position: 'absolute', fontSize: '8px' }}>#{index + 1}</p>
        <div className="text-center">
          <p className="text-bold" style={{ fontSize: '16px', marginBottom: '4px' }}>
            {resultsMap[j.result]?.shortName}
          </p>
          <p style={{ fontSize: '12px', marginBottom: 0 }}>{j.time} ms</p>
          <p style={{ fontSize: '12px' }}>{j.memory} KiB</p>
        </div>
      </div>
    );
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
                      {j.errMsg || j.outMsg ? (
                        <Popover
                          content={<pre>{[j.outMsg, j.errMsg].filter((f) => f).join('\n')}</pre>}
                          overlayStyle={{ zIndex: 1099 }}
                        >
                          {this.renderJudgeInfoCase(j, index)}
                        </Popover>
                      ) : (
                        this.renderJudgeInfoCase(j, index)
                      )}
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
