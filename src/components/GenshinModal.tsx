import React from 'react';
import { Modal } from 'antd';
import { ReduxProps } from '@/@types/props';
import { connect } from 'dva';
import style from './GenshinModal.less';
import GenshinButton from './GenshinButton';

export interface IGenshinModalProps extends ReduxProps {
  loadings: {
    [x: string]: boolean;
  };
  visible: boolean;
  cancelButton: boolean; // 是否展示取消按钮
  confirmButton: boolean; // 是否展示确认按钮
  onHide(): void;
  onOk(): void;
  loadingEffect?: string;
  confirmLoading?: boolean;
  title: string;
  disabled?: boolean;
  okText?: string;
  cancelText?: string;
  maskClosable?: boolean;
  useSound?: boolean;
  submit(dispatch: ReduxProps['dispatch'], values): Promise<IApiResponse<any>>;
  onSuccess?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onSuccessModalClosed?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onFail?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
}

interface State { }

class GenshinModal extends React.Component<IGenshinModalProps, State> {
  static defaultProps: Partial<IGenshinModalProps> = {
    cancelButton: true,
    confirmButton: true,
    useSound: false,
  };

  constructor(props: IGenshinModalProps) {
    super(props);
    this.state = {};
  }

  handleHideModel = () => {
    this.props.onHide();
  };

  componentDidUpdate(prevProps: Readonly<IGenshinModalProps>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevProps.visible !== this.props.visible && this.props.useSound) {
      if (this.props.visible) {
        // 打开
        const sound = new Howl({
          src: ['/assets/music/Genshin_UIAudio_ModalOpen.mp3']
        })
        sound.play();
      } else {
        const sound = new Howl({
          src: ['/assets/music/Genshin_UIAudio_ModalClose.mp3']
        })
        sound.play();
      }
    }
  }

  render() {
    const {
      visible,
      children,
      loadings,
      loadingEffect,
      confirmLoading,
      title,
      okText,
      cancelText,
      maskClosable,
      onHide,
      onOk,
    } = this.props;

    return (
      <Modal
        title={title}
        visible={visible}
        confirmLoading={confirmLoading ?? (loadings[loadingEffect] || false)}
        maskClosable={maskClosable}
        className={style.genshinModal}
        closable={false}
        centered
        okType="default"
        footer={
          <div className={style.genshinModalFooter}>
            {this.props.cancelButton && (
              <GenshinButton
                text={cancelText || '取消'}
                iconType="cancel"
                onClick={() => onHide()}
                style={{ zIndex: 10 }}
                useSound
              />
            )}
            {this.props.confirmButton && (
              <GenshinButton
                text={okText || '确认'}
                onClick={() => onOk()}
                loading={confirmLoading ?? (loadings[loadingEffect] || false)}
                style={{ zIndex: 10 }}
                useSound
              />
            )}
          </div>
        }
      >
        <div className={style.genshinModalContent}>
          <div className={style.genshinModalInnerBorder}>
            {/* 内边框-四角:  1左上，2右上，3左下，4右下*/}
            <div className={style.genshinModalInnerBorderCorner}></div>
            <div className={style.genshinModalInnerBorderCorner}></div>
            <div className={style.genshinModalInnerBorderCorner}></div>
            <div className={style.genshinModalInnerBorderCorner}></div>
            {/* 内边框-四边： 1上，2下，3左，4左*/}
            <div className={style.genshinModalInnerBorderSide}></div>
            <div className={style.genshinModalInnerBorderSide}></div>
            <div className={style.genshinModalInnerBorderSide}></div>
            <div className={style.genshinModalInnerBorderSide}></div>
          </div>
          <div style={{ zIndex: 10 }}>
            {children}
          </div>
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    loadings: state.loading.effects,
  };
}

export default connect(mapStateToProps)(GenshinModal);
