import React from 'react';
import { Form, Input } from 'antd';
import router from 'umi/router';
import gStyles from '@/general.less';

export interface Props {
  label: string;
  placeholder: string;
  disableActionTrigger?: boolean;
  toDetailLink?: (string) => string;
}

interface State {
  value: string;
}

class ToDetailCard extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    label: '',
    placeholder: '',
    disableActionTrigger: false,
    toDetailLink: () => '',
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
    const { toDetailLink } = this.props;
    if (this.state.value) {
      router.push(toDetailLink(this.state.value));
    }
  };

  render() {
    const { label, placeholder } = this.props;
    return (
      <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
        <Form.Item label={label}>
          <Input.Search
            enterButton="Go"
            placeholder={placeholder}
            className="input-button"
            onChange={e => this.setState({ value: e.target.value })}
            onSearch={this.handleSubmit}
          />
        </Form.Item>
      </Form>
    );
  }
}

export default ToDetailCard;
