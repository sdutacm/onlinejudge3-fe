import React from 'react';
import { connect } from 'dva';
import { Form, Drawer, Button, Spin } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import GeneralForm, { IGeneralFormItem } from './GeneralForm';

export interface IGeneralFormDrawerProps extends ReduxProps, FormProps {
  loadings: {
    [x: string]: boolean;
  };
  loading?: boolean;
  loadingEffect?: string;
  fetchLoading?: boolean;
  fetchLoadingEffect?: string;
  title: string;
  items: IGeneralFormItem[];
  initialValues?: object;
  hiddenValues?: object;
  okText?: string;
  cancelText?: string;
  autoMsg?: boolean;
  className?: string;
  width?: number;
  disabled?: boolean;
  maskClosable?: boolean;
  submit(dispatch: ReduxProps['dispatch'], values): Promise<IApiResponse<any>>;
  onSuccess?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onSuccessAndClosed?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
  onFail?(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>): void;
}

interface State {
  visible: boolean;
}

class GeneralFormDrawer extends React.Component<IGeneralFormDrawerProps, State> {
  constructor(props: IGeneralFormDrawerProps) {
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
      onSuccessAndClosed,
      onFail,
      autoMsg,
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // console.log('form ok', values);
        submit(dispatch, { ...values, ...hiddenValues })?.then((ret) => {
          autoMsg && msg.auto(ret);
          if (ret.success) {
            onSuccess?.(dispatch, ret);
            this.handleHideDrawer();
            onSuccessAndClosed &&
              setTimeout(
                () => onSuccessAndClosed(dispatch, ret),
                constants.drawerAnimationDuration + 100,
              );
          } else {
            onFail?.(dispatch, ret);
          }
        });
      }
    });
  };

  handleShowDrawer = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (!this.props.disabled) {
      this.setState({ visible: true });
    }
  };

  handleHideDrawer = () => {
    this.setState({ visible: false });
  };

  render() {
    const {
      children,
      form,
      loadings,
      loading,
      loadingEffect,
      fetchLoading,
      fetchLoadingEffect,
      title,
      items,
      initialValues,
      okText,
      cancelText,
      className,
      width,
      maskClosable,
    } = this.props;
    const submitLoading = loading || loadings[loadingEffect] || false;
    const getLoading = fetchLoading || loadings[fetchLoadingEffect] || false;

    return (
      <>
        <span className={className} onClick={this.handleShowDrawer}>
          {children}
        </span>
        <Drawer
          title={title}
          width={width}
          onClose={this.handleHideDrawer}
          visible={this.state.visible}
          className="form-drawer"
          maskClosable={maskClosable}
        >
          <div className="form-drawer-content">
            {getLoading ? (
              <Spin spinning={getLoading}>
                <div style={{ height: '320px' }} />
              </Spin>
            ) : (
              <GeneralForm form={form} items={items} initialValues={initialValues} />
            )}
          </div>
          <div className="form-drawer-bottom pos-bottom-right">
            <div className="actions">
              <Button onClick={this.handleHideDrawer} style={{ marginRight: 8 }}>
                {cancelText || 'Cancel'}
              </Button>
              <Button onClick={this.handleOk} type="primary" loading={submitLoading}>
                {okText || 'Submit'}
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loadings: state.loading.effects,
  };
}

export default connect(mapStateToProps)(Form.create()(GeneralFormDrawer));
