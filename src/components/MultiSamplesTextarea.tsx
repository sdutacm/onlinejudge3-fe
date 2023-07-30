import React from 'react';
import { Button, Icon, Input } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

interface Props {
  form: WrappedFormUtils;
  value: any;
  disabled?: boolean;
  className?: string;
}

interface State {
  orderTs: number;
  samples: { in: string; out: string }[];
}

class MultiSamplesTextarea extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    disabled: false,
    className: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      orderTs: 0,
      samples: [],
    };
  }

  componentDidMount() {
    // @ts-ignore
    const fieldName: string = this.props.id; // from antd form
    this.props.form.setFieldsValue({
      [fieldName]: this.props.value || [],
    });
    this.setState({
      samples: this.props.value || [],
    });
  }

  handleSampleChange = (e, type: 'in' | 'out', index: number) => {
    const samples = [...this.state.samples];
    samples[index][type] = e.target.value;
    this.setState({
      samples,
    });
    // @ts-ignore
    const fieldName: string = this.props.id;
    this.props.form.setFieldsValue({
      [fieldName]: samples,
    });
  };

  handleAddSample = () => {
    const samples = [...this.state.samples, { in: '', out: '' }];
    this.setState({
      samples,
    });
    // @ts-ignore
    const fieldName: string = this.props.id;
    this.props.form.setFieldsValue({
      orderTs: Date.now(),
      [fieldName]: samples,
    });
  };

  handleDeleteSample = (index: number) => {
    const samples = [...this.state.samples];
    samples.splice(index, 1);
    this.setState({
      orderTs: Date.now(),
      samples,
    });
    // @ts-ignore
    const fieldName: string = this.props.id;
    this.props.form.setFieldsValue({
      [fieldName]: samples,
    });
  };

  render() {
    const innerProps = { ...this.props };
    delete innerProps.form;
    delete innerProps.className;

    return (
      <div>
        {this.state.samples.map((sample, index) => (
          <div key={`${index}-${this.state.orderTs}`}>
            <h4 className="mt-md mb-sm">
              <span>#{index + 1}</span>
              <Button
                shape="circle"
                size="small"
                icon="minus"
                className="ml-md"
                onClick={() => this.handleDeleteSample(index)}
              />
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, calc(50% - 2px))',
                gridColumnGap: '4px',
              }}
            >
              <div>
                <h5>Input</h5>
                <Input.TextArea
                  wrap="off"
                  value={sample.in}
                  onChange={(e) => this.handleSampleChange(e, 'in', index)}
                  rows={5}
                  disabled={this.props.disabled}
                />
              </div>
              <div>
                <h5>Output</h5>
                <Input.TextArea
                  wrap="off"
                  value={sample.out}
                  onChange={(e) => this.handleSampleChange(e, 'out', index)}
                  rows={5}
                  disabled={this.props.disabled}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="mt-md">
          <Button size="small" onClick={this.handleAddSample}>
            <Icon type="plus" />
            Sample
          </Button>
        </div>
      </div>
    );
  }
}

export default MultiSamplesTextarea;
