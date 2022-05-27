import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';
import { IBalloon } from '@/common/interfaces/balloon';
import { numberToAlphabet } from '@/utils/format';
import { EBalloonType, EBalloonStatus } from '@/common/enums';
import { formatCompetitionUserSeatId } from '@/utils/competition';

export interface Props extends ReduxProps, RouteProps {
  data: IBalloon;
  onReceive?(): void | Promise<void>;
}

interface State {
  visible: boolean;
}

class ReceiveBalloonModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount(): void {
    this.props.dispatch({
      type: 'problems/getTagList',
    });
  }

  handleOk = () => {
    const { dispatch, data } = this.props;
    dispatch({
      type: 'competitions/updateCompetitionBalloonStatus',
      payload: {
        id: data.competitionId,
        balloonId: data.balloonId,
        data: { status: EBalloonStatus.doing },
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        msg.success('Receive successfully');
        this.handleHideModel();
        this.props.onReceive?.();
      }
    });
  };

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, loading, data } = this.props;

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Confirm Balloon Task to Receive"
          visible={this.state.visible}
          okText="Confirm"
          confirmLoading={loading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <div className="text-center" style={{ fontSize: '26px' }}>
            <div style={{ fontSize: '16px' }}>
              {data.type === EBalloonType.recall ? (
                <span className="text-danger text-bold">Recall</span>
              ) : (
                <span className="text-secondary text-bold">Delivery</span>
              )}
            </div>
            <div className="mt-lg" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="text-bold">{numberToAlphabet(data.problemIndex)}</span>
              {!!data.balloonColor && (
                <span
                  className="ml-lg"
                  style={{
                    display: 'inline-block',
                    borderRadius: '100%',
                    width: '20px',
                    height: '20px',
                    background: data.balloonColor,
                  }}
                ></span>
              )}
              {!!data.balloonAlias && <span className="ml-sm">{data.balloonAlias}</span>}
              {data.isFb && <span className="ml-sm text-success">(FB)</span>}
            </div>
            <div className="mt-lg">
              <p className="mb-sm">{formatCompetitionUserSeatId(data)}</p>
              <p className="mb-md" style={{ fontSize: '18px' }}>
                {data.subname || data.nickname}
              </p>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['competitions/updateCompetitionBalloonStatus'],
  };
}

export default connect(mapStateToProps)(ReceiveBalloonModal);
