import React from 'react';
import { Modal, Button } from 'antd';
import { connect } from 'dva';
import tracker from '@/utils/tracker';
import pkg from '../../package.json';
import { ReduxProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';

export interface Props extends ReduxProps {
  read: INotices['read'];
}

interface State {
  visible: boolean;
}

class NoticeModal extends React.Component<Props, State> {
  private noticeId = '3.2.0';

  constructor(props) {
    super(props);
    this.state = {
      visible: pkg.version === this.noticeId && !props.read[this.noticeId],
    };
  }

  componentDidMount() {
    if (pkg.version === this.noticeId && !this.props.read[this.noticeId]) {
      this.props.dispatch({
        type: 'notices/setNoticeRead',
        payload: {
          noticeId: this.noticeId,
        },
      });
      tracker.event({
        category: 'component.NoticeModal',
        action: 'show',
        label: this.noticeId,
      });
    }
  }

  handleHideModel = () => {
    this.setState({ visible: false });
    tracker.event({
      category: 'component.NoticeModal',
      action: 'close',
      label: this.noticeId,
    });
  };

  handleViewDetail = () => {
    this.handleHideModel();
    tracker.event({
      category: 'component.NoticeModal',
      action: 'viewDetail',
      label: this.noticeId,
    });
  };

  render() {
    const { read } = this.props;

    return (
      <Modal
        title=""
        className="notice-modal"
        visible={this.state.visible}
        onCancel={this.handleHideModel}
        footer={null}
        maskClosable={false}
        centered
        // width={400}
      >
        <div className="text-center mt-xl mb-xl">
          <h2 style={{ marginTop: '36px', marginBottom: '60px' }}>
            OnlineJudge v{this.noticeId} Released
          </h2>
          <p>推出全新的模块 Sets 和 Groups！</p>
          <p>
            以及 <strong>S&G</strong>，一个全新的概念。
          </p>
          <p>更有多项优化改进等你发现。</p>
          <Link
            to={urlf(pages.posts.detail, { param: { id: 33 } })}
            onClick={this.handleViewDetail}
          >
            <Button type="primary" style={{ marginTop: '60px' }}>
              查看新功能介绍
            </Button>
          </Link>
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    read: state.notices.read,
  };
}

export default connect(mapStateToProps)(NoticeModal);
