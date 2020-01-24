import React from 'react';
import { Modal } from 'antd';
import tracker from '@/utils/tracker';

export interface Props {
  rpKey: string;
  rpNote: string;
  className?: string;
}

interface State {
  visible: boolean;
}

class RedPacketModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleShowModel = e => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
    tracker.event({
      category: 'component.RedPacketModal',
      action: 'show',
    });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, className, rpKey, rpNote } = this.props;

    return (
      <>
        <a className={className} onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Red Packet"
          className="red-packet-modal"
          visible={this.state.visible}
          onOk={this.handleHideModel}
          onCancel={this.handleHideModel}
          footer={null}
          width={400}
        >
          <div className="text-center">
            <p style={{ fontSize: '27px', marginTop: '30px' }}>送你一个 AC 红包</p>
            <p style={{ fontSize: '16px', marginTop: '60px' }}>祝你</p>
            <p style={{ fontSize: '17px', marginTop: '42px', marginBottom: '81px', fontWeight: 600 }}>{rpNote}</p>
            <p>打开支付宝红包</p>
            <p>输入口令</p>
            <p><span style={{ fontSize: '21px', fontWeight: 600 }}>{rpKey}</span></p>
            <p style={{ marginBottom: '30px' }}>即可领取</p>
          </div>
        </Modal>
      </>
    );
  }
}

export default RedPacketModal;
