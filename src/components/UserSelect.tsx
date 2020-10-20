import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { ReduxProps } from '@/@types/props';
import Select, { SelectProps } from 'antd/lib/select';
import { debounce } from 'lodash';
import UserBar from './UserBar';

export interface Props extends ReduxProps, SelectProps {
  multiple: boolean;
}

interface State {
  data: IUser[];
  fetching: boolean;
}

class UserSelect extends React.Component<Props, State> {
  private lastReqId: number;
  static defaultProps: Partial<Props> = {
    multiple: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      fetching: false,
    };
    this.lastReqId = 0;
    this.searchUserByNickname = debounce(this.searchUserByNickname, 750);
  }

  searchUserByNickname = (nickname: string) => {
    this.lastReqId += 1;
    const reqId = this.lastReqId;
    if (!nickname) {
      this.setState({ data: [], fetching: false });
      return;
    }
    this.setState({ data: [], fetching: true });
    this.props
      .dispatch({
        type: 'users/searchUser',
        payload: {
          nickname,
          limit: 200,
        },
      })
      .then((ret: IApiResponse<IList<IUser>>) => {
        if (reqId !== this.lastReqId) {
          return;
        }
        let data: IUser[] = [];
        if (ret.success) {
          data = ret.data.rows;
        }
        this.setState({ data, fetching: false });
      });
  };

  handleChange = (...args) => {
    this.setState({
      data: [],
      fetching: false,
    });
    // @ts-ignore
    this.props.onChange(...args);
  };

  render() {
    const { multiple } = this.props;
    const { fetching, data } = this.state;
    return (
      <Select
        {...this.props}
        mode={multiple ? 'multiple' : undefined}
        showArrow={!!multiple}
        showSearch={!multiple}
        defaultActiveFirstOption={false}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        filterOption={false}
        optionLabelProp="title"
        onSearch={this.searchUserByNickname}
        onChange={this.handleChange}
        labelInValue
      >
        {data.map((d) => (
          <Select.Option key={`${d.userId}`} title={d.nickname}>
            <UserBar user={d} showAsText />
          </Select.Option>
        ))}
      </Select>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(UserSelect);
