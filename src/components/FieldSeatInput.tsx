import React from 'react';
import { Input, Popover } from 'antd';
import msg from '@/utils/msg';

export interface Props {
  nextSeatNo: number;
  seatNo?: number;
  boundIp?: string;
  validateSeatNo?(seatNo: number): string | null;
  onChange?(info: { seatNo: number; boundIp?: string }): any;
  onDelete?(): any;
}

interface State {
  popoverVisible: boolean;
  inputSeatNo?: string;
  inputBoundIp?: string;
}

export default class FieldSeatInput extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      popoverVisible: false,
      inputSeatNo: props.seatNo
        ? `${props.seatNo}`
        : props.nextSeatNo
        ? `${props.nextSeatNo}`
        : undefined,
      inputBoundIp: props.boundIp ? props.boundIp : undefined,
    };
  }

  componentWillReceiveProps(np: Props) {
    if (np.seatNo !== this.props.seatNo || np.nextSeatNo !== this.props.nextSeatNo) {
      this.setState({
        inputSeatNo: np.seatNo ? `${np.seatNo}` : np.nextSeatNo ? `${np.nextSeatNo}` : undefined,
      });
    }
    if (np.boundIp !== this.props.boundIp) {
      this.setState({
        inputBoundIp: np.boundIp ? np.boundIp : undefined,
      });
    }
  }

  get isAddNew() {
    return !this.props.seatNo;
  }

  hideInputPopover = () => {
    this.setState({
      popoverVisible: false,
    });
  };

  handleInputPopoverVisibleChange = (popoverVisible) => {
    this.setState({ popoverVisible });
  };

  handleSave = () => {
    const { inputSeatNo, inputBoundIp } = this.state;
    const seatNo = +inputSeatNo;
    if (!seatNo) {
      msg.error('Please input Seat No.');
      return;
    }
    const validateRes = this.props.validateSeatNo?.(seatNo);
    if (validateRes) {
      msg.error(validateRes || 'Please input valid Seat No.');
      return;
    }
    this.props.onChange?.({ seatNo, boundIp: inputBoundIp });
    this.setState({
      popoverVisible: false,
    });
  };

  handleDelete = () => {
    this.props.onDelete?.();
    this.setState({
      popoverVisible: false,
    });
  };

  render() {
    const { children } = this.props;
    const { popoverVisible, inputSeatNo, inputBoundIp } = this.state;
    return (
      <Popover
        content={
          <div>
            <div>
              <p>Seat No.</p>
              <Input
                className="mt-sm"
                size="small"
                value={inputSeatNo}
                onChange={(e) => this.setState({ inputSeatNo: e.target.value })}
              />
            </div>
            <div className="mt-md">
              <p>IP (optional)</p>
              <Input
                className="mt-sm"
                size="small"
                value={inputBoundIp}
                onChange={(e) => this.setState({ inputBoundIp: e.target.value })}
              />
            </div>
            <div className="field-seat-input-action mt-md-lg">
              <a onClick={this.handleSave}>Save</a>
              {!this.isAddNew && (
                <a className="text-danger" onClick={this.handleDelete}>
                  Delete
                </a>
              )}
            </div>
          </div>
        }
        title={this.isAddNew ? 'Add Seat' : 'Update Seat'}
        trigger="click"
        arrowPointAtCenter
        overlayStyle={{ width: '200px' }}
        visible={popoverVisible}
        onVisibleChange={this.handleInputPopoverVisibleChange}
      >
        {children}
      </Popover>
    );
  }
}
