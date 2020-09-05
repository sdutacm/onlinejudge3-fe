import React from 'react';
import { withRouter } from 'react-router';
import { FormProps, RouteProps } from '@/@types/props';
import { Form, Input, Select, Button } from 'antd';
import router from 'umi/router';
import gStyles from '@/general.less';
import tracker from '@/utils/tracker';

export interface FilterCardFieldSelectOptionItem {
  displayName: string;
  fieldName: string | number | boolean;
}

export interface FilterCardFieldOption {
  displayName: string;
  fieldName: string | number;
  options?: FilterCardFieldSelectOptionItem[];
}

export interface Props extends RouteProps, FormProps {
  fields: FilterCardFieldOption[];
  initQuery?: any;
  disableActionTrigger?: boolean;
}

class FilterCard extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    fields: [],
    disableActionTrigger: false,
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.props.disableActionTrigger) {
          return;
        }
        const { pathname, query } = this.props.location;
        tracker.event({
          category: 'component.FilterCard',
          action: 'submit',
        });
        router.replace({
          pathname,
          query: {
            ...query,
            ...values,
            page: 1,
          },
        });
      }
    });
  };

  handleReset = (e) => {
    e.preventDefault();
    this.props.form.resetFields();
    if (this.props.disableActionTrigger) {
      return;
    }
    router.replace({ pathname: this.props.location.pathname, query: this.props.initQuery });
  };

  render() {
    const {
      location: { query },
      fields,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form
        layout="vertical"
        hideRequiredMark={true}
        onSubmit={this.handleSubmit}
        onReset={this.handleReset}
        className={gStyles.cardForm}
      >
        {fields.map((field: FilterCardFieldOption) => (
          <Form.Item label={field.displayName} key={field.fieldName}>
            {getFieldDecorator(field.fieldName, { initialValue: query[field.fieldName] })(
              field.options ? (
                <Select>
                  {field.options.map((f) => (
                    <Select.Option key={f.fieldName.toString()}>{f.displayName}</Select.Option>
                  ))}
                </Select>
              ) : (
                <Input />
              ),
            )}
          </Form.Item>
        ))}
        {fields.length ? (
          <Form.Item>
            <Button.Group style={{ width: '100%' }}>
              <Button
                htmlType="reset"
                className="text-ellipsis"
                style={{ width: '50%' }}
                title="Clear"
              >
                Clear
              </Button>
              <Button
                htmlType="submit"
                className="text-ellipsis"
                style={{ width: '50%' }}
                title="Filter"
              >
                Filter
              </Button>
            </Button.Group>
          </Form.Item>
        ) : (
          <div />
        )}
      </Form>
    );
  }
}

export default withRouter(Form.create()(FilterCard));
