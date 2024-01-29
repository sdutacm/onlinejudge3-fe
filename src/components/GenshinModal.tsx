import React from 'react';
import { Modal } from 'antd';
import { ReduxProps } from '@/@types/props';
import { connect } from 'dva';
import style from './GenshinModal.less'
import GenshinButton from './GenshinButton';

export interface IGenshinModalProps extends ReduxProps {
  loadings: {
    [x: string]: boolean;
  }
  visible: boolean;
  onHide(): void;
  loadingEffect?: string;
  title: string;
  disabled?: boolean;
  okText?: string;
  cancelText?: string;
  maskClosable?: boolean;
  submit(dispatch: ReduxProps['dispatch'], values): Promise<IApiResponse<any>>;
  onSuccess?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onSuccessModalClosed?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onFail?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
}

interface State { }

class GenshinModal extends React.Component<IGenshinModalProps, State> {
  constructor(props: IGenshinModalProps) {
    super(props);
    this.state = {};
  }

  handleOk = () => {

  }

  handleHideModel = () => {
    this.props.onHide();
  }

  render() {
    const {
      children,
      loadings,
      loadingEffect,
      title,
      okText,
      cancelText,
      maskClosable,
    } = this.props;

    return (
      <>
        <Modal
          title={title}
          visible={this.props.visible}
          okText={okText || '确认'}
          cancelText={cancelText || '取消'}
          confirmLoading={loadings[loadingEffect] || false}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
          maskClosable={maskClosable}
          className={style.genshinModal}
          closable={false}
          centered
          okType="default"
          footer={(
            <div className={style.genshinModalFooter}>
              <GenshinButton text="取消" buttonType="default" iconType="cancel" />
              <GenshinButton text="解锁" buttonType="default" />
            </div>
          )}
        >
          <div className={style.genshinModalContent}>
            {children}
          </div>
        </Modal>
      </>
    )
  }
}

function mapStateToProps(state) {
  return {
    loadings: state.loading.effects,
  };
}

export default connect(mapStateToProps)(GenshinModal);