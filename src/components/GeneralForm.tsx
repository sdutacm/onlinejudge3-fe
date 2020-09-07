import React from 'react';
import { Form, Input, Select, Checkbox, DatePicker } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import moment from 'moment';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import RtEditor from './RtEditor';

export interface IGeneralFormItem {
  name: string;
  field: string;
  component: 'input' | 'textarea' | 'select' | 'checkbox' | 'datetime' | 'richtext';
  rules: object[];
  placeholder?: string;
  initialValue?: any;
  disabled?: boolean;
  type?: string; // for input
  rows?: number; // for textarea
  contentStyle?: React.CSSProperties; // for richtext
  options?: {
    // for select
    value: string;
    name: string;
  }[];
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
              return (
                <Form.Item key={item.field} label={item.name}>
                  {getFieldDecorator(item.field, {
                    rules: item.rules,
                    initialValue: initialValues[item.field] || item.initialValue,
                  })(
                    <Select placeholder={item.placeholder} disabled={item.disabled}>
                      {item.options.map((opt) => (
                        <Select.Option key={opt.value}>{opt.name}</Select.Option>
                      ))}
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
                    initialValue: moment(initialValues[item.field] || item.initialValue),
                  })(<DatePicker showTime placeholder={item.placeholder || 'Choose Time'} />)}
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
