import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal, Checkbox, DatePicker } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import moment from 'moment';

export interface IGeneralFormItem {
  name: string;
  field: string;
  component: 'input' | 'textarea' | 'select' | 'checkbox' | 'datetime';
  rules: object[];
  placeholder?: string;
  initialValue?: any;
  disabled?: boolean;
  type?: string; // for input
  rows?: number; // for textarea
  options?: { // for select
    value: string;
    name: string;
  }[];
}

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
    const { dispatch, form, hiddenValues, submit, onSuccess, onSuccessModalClosed, onFail, autoMsg } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // console.log('form ok', values);
        submit(dispatch, { ...values, ...hiddenValues }).then(ret => {
          autoMsg && msg.auto(ret);
          if (ret.success) {
            onSuccess && onSuccess(dispatch, ret);
            this.handleHideModel();
            onSuccessModalClosed && setTimeout(() => onSuccessModalClosed(dispatch, ret),
              constants.modalAnimationDurationFade
            );
          } else {
            onFail && onFail(dispatch, ret);
          }
        });
      }
    });
  };

  handleShowModel = e => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, form, loadings, loadingEffect, title, items, okText, cancelText } = this.props;
    let { initialValues } = this.props;
    initialValues = initialValues || {};
    const { getFieldDecorator } = form;

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title={title}
          visible={this.state.visible}
          okText={okText || 'Submit'}
          cancelText={cancelText || 'Cancel'}
          confirmLoading={loadings[loadingEffect] || false}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            {items.map(item => {
              switch (item.component) {
                case 'input':
                  return (
                    <Form.Item key={item.field} label={item.name}>
                      {getFieldDecorator(item.field, {
                        rules: item.rules,
                        initialValue: initialValues[item.field] || item.initialValue,
                      })(<Input placeholder={item.placeholder} type={item.type || 'text'} disabled={item.disabled} />)}
                    </Form.Item>
                  );
                case 'textarea':
                  return (
                    <Form.Item key={item.field} label={item.name}>
                      {getFieldDecorator(item.field, {
                        rules: item.rules,
                        initialValue: initialValues[item.field] || item.initialValue,
                      })(<Input.TextArea placeholder={item.placeholder} rows={item.rows} disabled={item.disabled} />)}
                    </Form.Item>
                  );
                case 'select':
                  return (
                    <Form.Item key={item.field} label={item.name}>
                      {getFieldDecorator(item.field, {
                        rules: item.rules,
                        initialValue: initialValues[item.field] || item.initialValue,
                      })(
                        <Select placeholder={item.placeholder} disabled={item.disabled} >
                          {item.options.map(opt => (<Select.Option key={opt.value}>{opt.name}</Select.Option>))}
                        </Select>
                      )}
                    </Form.Item>
                  );
                case 'checkbox':
                  return (
                    <Form.Item key={item.field}>
                      {getFieldDecorator(item.field, {
                        valuePropName: 'checked',
                        initialValue: initialValues[item.field] || item.initialValue || false,
                      })(<Checkbox>{item.name}</Checkbox>)}
                    </Form.Item>
                  );
                case 'datetime':
                  return (
                    <Form.Item key={item.field} label={item.name}>
                      {getFieldDecorator(item.field, {
                        rules: item.rules,
                        initialValue: moment(initialValues[item.field] || item.initialValue),
                      })(<DatePicker showTime placeholder={item.placeholder || 'Choose Time'} />)}
                    </Form.Item>
                  );
              }
              return null;
            })}
          </Form>
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
