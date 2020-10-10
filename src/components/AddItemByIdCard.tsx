import React from 'react';
import { Form, Input } from 'antd';
import gStyles from '@/general.less';

export interface Props {
  label: string;
  placeholder: string;
  disableActionTrigger?: boolean;
  onAdd?: (number) => void | Promise<void>;
}

interface State {
  value: string;
}

class AddItemByIdCard extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    label: '',
    placeholder: '',
    disableActionTrigger: false,
    onAdd: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  handleSubmit = () => {
    if (this.props.disableActionTrigger) {
      return;
    }
    const { onAdd, label } = this.props;
    if (this.state.value) {
      onAdd(+this.state.value);
    }
  };

  render() {
    const { label, placeholder } = this.props;
    return (
      <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
        <Form.Item label={label}>
          <Input.Search
            enterButton="Add"
            placeholder={placeholder}
            className="input-button"
            onChange={(e) => this.setState({ value: e.target.value })}
            onSearch={this.handleSubmit}
          />
        </Form.Item>
      </Form>
    );
  }
}

export default AddItemByIdCard;
