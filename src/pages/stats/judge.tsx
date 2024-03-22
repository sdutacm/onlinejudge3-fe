/**
 * title: Judge Status
 */

import React from 'react';
import { connect } from 'dva';
import { Progress, Tag, Popover } from 'antd';
import classNames from 'classnames';
import { capitalize } from 'lodash-es';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { IGetJudgeQueueStatsResp } from '@/common/contracts/stat';
import PageLoading from '@/components/PageLoading';
import { sleep } from '@/utils/misc';
import { EStatJudgeQueueWorkerStatus } from '@/common/enums';

interface Props extends ReduxProps, RouteProps {
  judgeQueueStats: IGetJudgeQueueStatsResp;
}

interface State {}

enum JudgerClusterLoad {
  Normal = 'Normal',
  Medium = 'Medium',
  Busy = 'Busy',
  UltraBusy = 'Ultra Busy',
}

class Judge extends React.Component<Props, State> {
  private polling = true;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  fetch = async () => {
    try {
      await this.props.dispatch({
        type: 'stats/getJudgeQueueStats',
      });
    } catch (e) {
      console.error('Failed to fetch judge queue stats', e);
    }
  };

  pollFetch = async () => {
    while (true) {
      if (!this.polling) {
        break;
      }
      await this.fetch();
      await sleep(1000);
    }
  };

  componentDidMount() {
    this.pollFetch();
  }

  componentWillUnmount() {
    this.polling = false;
  }

  getJudgerClusterLoad = () => {
    const { waiting, workerGroups } = this.props.judgeQueueStats;
    const workerNum = workerGroups.reduce((acc, group) => acc + group.workers.length, 0);
    if (workerNum <= 0) {
      return null;
    }
    if (waiting <= 0) {
      return 'Normal';
    }
    const waitingLoad = waiting / workerNum;
    if (waitingLoad < 1) {
      return JudgerClusterLoad.Normal;
    }
    if (waitingLoad < 2.5) {
      return JudgerClusterLoad.Medium;
    }
    if (waitingLoad < 8) {
      return JudgerClusterLoad.Busy;
    }
    return JudgerClusterLoad.UltraBusy;
  };

  getNodeStatus = (status: number) => {
    if (status === EStatJudgeQueueWorkerStatus.idle) {
      return 'Idle';
    }
    if (status === EStatJudgeQueueWorkerStatus.judging) {
      return 'Judging';
    }
    return '--';
  };

  render() {
    const { judgeQueueStats } = this.props;
    // @ts-ignore
    if (judgeQueueStats._updatedAt === -1) {
      return <PageLoading />;
    }

    const { running, waiting, queueSize, workerGroups } = judgeQueueStats;
    const workerNum = workerGroups.reduce((acc, group) => acc + group.workers.length, 0);
    let totalPercent = 0;
    let judgingPercent = 0;
    if (queueSize > 0) {
      if (waiting > 0) {
        totalPercent = 100;
        judgingPercent = (running / queueSize) * 100;
      } else if (workerNum > 0) {
        totalPercent = (running / workerNum) * 100;
        judgingPercent = (running / workerNum) * 100;
      }
    }
    const load = this.getJudgerClusterLoad();

    return (
      <PageAnimation>
        <div className="content-view-xxs full-width-inner-content user-select-none mt-xl mb-lg">
          <h2>Judge Status</h2>
          <div style={{ marginTop: '45px' }}>
            <Progress
              percent={totalPercent}
              successPercent={judgingPercent}
              showInfo={false}
              className="judge-queue-stats-process"
            />
          </div>
          <div className="judge-queue-stats-board mt-md">
            <div className="judge-queue-stats-board-row">
              <div className="judge-queue-stats-board-row-label">Judging / In Queue</div>
              <div className="judge-queue-stats-board-row-value">
                <Tag className="judge-queue-stats-board-item-judging cursor-default">{running}</Tag>
                <span className="inline-block ml-sm-md mr-sm-md">/</span>
                <Tag className="judge-queue-stats-board-item-in-queue cursor-default" color="blue">
                  {waiting}
                </Tag>
              </div>
            </div>
          </div>

          <div className="judge-queue-stats-board" style={{ marginTop: '45px' }}>
            {workerGroups.length > 0 && (
              <div className="judge-queue-stats-board-row">
                <div className="judge-queue-stats-board-row-label">Judger Cluster Load</div>
                <div className="judge-queue-stats-board-row-value">
                  {load === JudgerClusterLoad.Normal && (
                    <Tag className="cursor-default">Normal</Tag>
                  )}
                  {load === JudgerClusterLoad.Medium && (
                    <Tag className="judge-queue-stats-bg-warn cursor-default">Medium</Tag>
                  )}
                  {load === JudgerClusterLoad.Busy && (
                    <Tag className="judge-queue-stats-bg-danger cursor-default">Busy</Tag>
                  )}
                  {load === JudgerClusterLoad.UltraBusy && (
                    <Tag className="judge-queue-stats-bg-super-danger cursor-default">
                      Ultra Busy
                    </Tag>
                  )}
                </div>
              </div>
            )}
            <div className="judge-queue-stats-board-row mt-md">
              <div className="judge-queue-stats-board-row-label">Judger Total Cores</div>
              <div className="judge-queue-stats-board-row-value">{workerNum}</div>
            </div>
          </div>

          {workerGroups.length > 0 && (
            <div className="judge-queue-stats-node-graph mt-md-lg">
              <div className="judge-queue-stats-node-graph-header">Node Status</div>
              <div className="judge-queue-stats-node-groups">
                {workerGroups.map((g) => (
                  <div key={g.group} className="judge-queue-stats-node-group-container">
                    <Popover
                      content={
                        <div>
                          <p className="mb-sm">
                            Platform Arch: {capitalize(g.platform)} {g.arch}
                          </p>
                          <p className="mb-none">CPU: {g.cpuModel}</p>
                        </div>
                      }
                    >
                      <div className="judge-queue-stats-node-group-header">Cluster Node: {g.group}</div>
                    </Popover>
                    <div className="judge-queue-stats-node-container">
                      {g.workers.map((w) => (
                        <Popover
                          content={
                            <div>
                              <p className="mb-sm">Status: {this.getNodeStatus(w.status)}</p>
                            </div>
                          }
                          title={`Node ID: ${w.id}`}
                          key={w.id}
                        >
                          <div
                            className={classNames('judge-queue-stats-node-graph-item', {
                              'type-judging': w.status === EStatJudgeQueueWorkerStatus.judging,
                              'type-fault': w.status === EStatJudgeQueueWorkerStatus.fault,
                            })}
                          />
                        </Popover>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    judgeQueueStats: state.stats.judgeQueueStats,
  };
}

export default connect(mapStateToProps)(Judge);
