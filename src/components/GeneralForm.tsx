import React from 'react';
import { Form, Input, Select, Checkbox, DatePicker } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import moment from 'moment';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import RtEditor from './RtEditor';

export interface IGeneralFormItem {
  name: string;
  field: string;
  component:
    | 'input'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'datetime'
    | 'richtext'
    | React.ReactNode;
  rules: object[];
  placeholder?: string;
  initialValue?: any;
  disabled?: boolean;
  type?: string; // for input
  rows?: number; // for textarea
  contentStyle?: React.CSSProperties; // for richtext
  uploadTarget?: 'media' | 'asset'; // for richtext, default 'media'
  uploadOption?: {
    // for richtext
    prefix?: string;
    maxSize?: number; // MiB
  };
  options?: {
    // for select
    value: string | number | boolean;
    name: string;
    icon?: React.ReactNode;
  }[];
  multiple?: boolean; // for select
  transformBeforeSubmit?: (value) => any;
}

export interface IGeneralFormProps extends ReduxProps, FormProps {
  form: WrappedFormUtils;
  items: IGeneralFormItem[];
  initialValues?: object;
}

interface State {
  visible: boolean;
}

class GeneralForm extends React.Component<IGeneralFormProps, State> {
  constructor(props: IGeneralFormProps) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  render() {
    const { form, items } = this.props;
    let { initialValues } = this.props;
    initialValues = initialValues || {};
    const { getFieldDecorator } = form;

    return (
      <Form layout="vertical" hideRequiredMark={true}>
        {items.map((item) => {
          if (typeof item.component === 'function') {
            const rules = [...(item.rules || [])];
            // @ts-ignore
            let requiredRuleIndex = rules.findIndex((r) => r.required === true);
            if (requiredRuleIndex > -1) {
              const rule = rules[requiredRuleIndex] as any;
              rules[requiredRuleIndex] = {
                ...rule,
                validator: (_, value, callback) => {
                  if (value.isEmpty()) {
                    callback(rule.message);
                  } else {
                    callback();
                  }
                },
              };
            }
            return (
              <Form.Item key={item.field} label={item.name}>
                {getFieldDecorator(item.field, {
                  validateTrigger: 'onBlur',
                  rules,
                  initialValue: initialValues[item.field] || item.initialValue,
                })(<item.component form={form} disabled={item.disabled} />)}
              </Form.Item>
            );
          }
          switch (item.component) {
            case 'input':
              return (
                <Form.Item key={item.field} label={item.name}>
                  {getFieldDecorator(item.field, {
                    rules: item.rules,
                    initialValue: initialValues[item.field] || item.initialValue,
                  })(
                    <Input
                      placeholder={item.placeholder}
                      type={item.type || 'text'}
                      disabled={item.disabled}
                    />,
                  )}
                </Form.Item>
              );
            case 'textarea':
              return (
                <Form.Item key={item.field} label={item.name}>
                  {getFieldDecorator(item.field, {
                    rules: item.rules,
                    initialValue: initialValues[item.field] || item.initialValue,
                  })(
                    <Input.TextArea
                      placeholder={item.placeholder}
                      rows={item.rows}
                      disabled={item.disabled}
                    />,
                  )}
                </Form.Item>
              );
            case 'select':
              const useCustomMode = item.options.some((i) => !!i.icon);
              return (
                <Form.Item key={item.field} label={item.name}>
                  {getFieldDecorator(item.field, {
                    rules: item.rules,
                    initialValue: initialValues[item.field] || item.initialValue,
                  })(
                    <Select
                      placeholder={item.placeholder}
                      disabled={item.disabled}
                      mode={item.multiple ? 'multiple' : undefined}
                      optionLabelProp={useCustomMode ? 'label' : undefined}
                    >
                      {item.options.map((opt) =>
                        useCustomMode ? (
                          <Select.Option key={`${opt.value}`} value={`${opt.value}`} label={`${opt.name}`}>{opt.icon}{opt.name}</Select.Option>
                        ) : (
                          <Select.Option key={`${opt.value}`}>{opt.name}</Select.Option>
                        ),
                      )}
                    </Select>,
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
                    initialValue:
                      initialValues[item.field] || item.initialValue
                        ? moment(initialValues[item.field] || item.initialValue)
                        : undefined,
                  })(
                    <DatePicker
                      showTime={{ format: 'HH:mm:ss' }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder={item.placeholder || 'Choose time'}
                      style={{ width: '100%' }}
                    />,
                  )}
                </Form.Item>
              );
            case 'richtext':
              const rules = [...(item.rules || [])];
              // @ts-ignore
              let requiredRuleIndex = rules.findIndex((r) => r.required === true);
              if (requiredRuleIndex > -1) {
                const rule = rules[requiredRuleIndex] as any;
                rules[requiredRuleIndex] = {
                  ...rule,
                  validator: (_, value, callback) => {
                    if (value.isEmpty()) {
                      callback(rule.message);
                    } else {
                      callback();
                    }
                  },
                };
              }
              return (
                <Form.Item key={item.field} label={item.name}>
                  {getFieldDecorator(item.field, {
                    validateTrigger: 'onBlur',
                    rules,
                    initialValue: initialValues[item.field] || item.initialValue,
                  })(
                    <RtEditor
                      form={form}
                      disabled={item.disabled}
                      contentStyle={item.contentStyle}
                      uploadTarget={item.uploadTarget}
                      uploadOption={item.uploadOption}
                    />,
                  )}
                </Form.Item>
              );
          }
          return null;
        })}
      </Form>
    );
  }
}

export default GeneralForm;
