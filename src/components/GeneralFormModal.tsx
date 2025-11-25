import React from 'react';
import { connect } from 'dva';
import { Form, Modal } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import GeneralForm, { IGeneralFormItem } from './GeneralForm';

export interface IGeneralFormModalProps extends ReduxProps, FormProps {
  loadings: {
    [x: string]: boolean;
  };
  loadingEffect?: string;
  title: string;
  items: IGeneralFormItem[];
  initialValues?: object;
  hiddenValues?: object;
  okText?: string;
  cancelText?: string;
  autoMsg?: boolean;
  className?: string;
  disabled?: boolean;
  maskClosable?: boolean;
  submit(dispatch: ReduxProps['dispatch'], values): Promise<IApiResponse<any>>;
  onSuccess?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onSuccessModalClosed?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onFail?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
}

interface State {
  visible: boolean;
}

class GeneralFormModal extends React.Component<IGeneralFormModalProps, State> {
  constructor(props: IGeneralFormModalProps) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handleOk = () => {
    const {
      dispatch,
      form,
      hiddenValues,
      submit,
      onSuccess,
      onSuccessModalClosed,
      onFail,
      autoMsg,
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // console.log('form ok', values);
        try {
          submit(dispatch, { ...values, ...hiddenValues })
            ?.then((ret) => {
              autoMsg && msg.auto(ret);
              if (ret.success) {
                onSuccess?.(dispatch, ret);
                this.handleHideModel();
                setTimeout(() => {
                  onSuccessModalClosed?.(dispatch, ret);
                  form.resetFields();
                }, constants.modalAnimationDurationFade);
              } else {
                onFail?.(dispatch, ret);
              }
            })
            ?.catch((e) => {
              console.log('form submit error:', e);
              msg.error(e.message);
            });
        } catch (e) {
          console.error('form submit error:', e);
          msg.error(e.message);
        }
      }
    });
  };

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (!this.props.disabled) {
      this.setState({ visible: true });
    }
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const {
      children,
      form,
      loadings,
      loadingEffect,
      title,
      items,
      initialValues,
      okText,
      cancelText,
      className,
      maskClosable,
    } = this.props;

    return (
      <>
        <span className={className} onClick={this.handleShowModel}>
          {children}
        </span>
        <Modal
          title={title}
          visible={this.state.visible}
          okText={okText || 'Submit'}
          cancelText={cancelText || 'Cancel'}
          confirmLoading={loadings[loadingEffect] || false}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
          maskClosable={maskClosable}
        >
          <GeneralForm form={form} items={items} initialValues={initialValues} />
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loadings: state.loading.effects,
  };
}

export default connect(mapStateToProps)(Form.create()(GeneralFormModal));
