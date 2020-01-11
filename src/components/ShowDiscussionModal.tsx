import React from 'react';
import { connect } from 'dva';
import { Modal } from 'antd';
import QRCodeImage from '@/assets/misc/onlinejudge3-qq-group-qrcode.jpg';
import tracker from '@/utils/tracker';

export interface Props {
  className?: string;
}

interface State {
  visible: boolean;
}

class ShowDiscussionModal extends React.Component<Props, State> {
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
      category: 'component.ShowDiscussionModal',
      action: 'show',
    });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, className } = this.props;

    return (
      <>
        <a className={className} onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Join Discussion"
          visible={this.state.visible}
          onOk={this.handleHideModel}
          onCancel={this.handleHideModel}
          footer={null}
          width={400}
        >
          <div className="content-area image-area">
            <img src={QRCodeImage} />
          </div>
        </Modal>
      </>
    );
  }
}

export default ShowDiscussionModal;
