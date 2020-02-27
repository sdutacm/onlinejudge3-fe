import React from 'react';
import { connect } from 'dva';
import { Input, Popover, Button } from 'antd';
import { PopoverProps } from 'antd/lib/popover';
import { ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps {
  type: IFavoriteType;
  id: number;
  placement?: PopoverProps['placement'];
  silent?: boolean;
}

interface State {
  visible: boolean;
  note: string;
}

class AddFavorite extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    placement: 'bottom',
    silent: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      note: '',
    };
  }

  componentDidMount(): void {
    this.props.dispatch({
      type: 'problems/getTagList',
    });
  }

  handleAdd = () => {
    const { dispatch, type, id, loading } = this.props;
    const { note } = this.state;
    if (loading) {
      return;
    }
    const target: any = {};
    switch (type) {
      case 'problem':
        target.problemId = id;
        break;
      case 'contest':
        target.contestId = id;
        break;
      case 'set':
        target.setId = id;
        break;
      case 'group':
        target.groupId = id;
        break;
    }
    dispatch({
      type: 'favorites/addFavorite',
      payload: {
        type,
        target,
        note: note || '',
      },
    }).then((ret) => {
      msg.auto(ret);
      if (ret.success) {
        dispatch({
          type: 'favorites/getList',
          payload: {
            force: true,
          },
        });
        msg.success('Added to favorites');
        this.setState({
          note: '',
        });
        this.handleHide();
        tracker.event({
          category: 'favorites',
          action: 'add',
        });
      }
    });
  };

  handleHide = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, loading, placement, silent } = this.props;
    if (!silent) {
      return (
        <Popover
          trigger="click"
          placement={placement}
          title="Add Favorite"
          content={
            <div>
              <Input.TextArea
                autosize={{ minRows: 2, maxRows: 6 }}
                placeholder="Note what you think... (optional)"
                className="mb-md"
                value={this.state.note}
                onChange={(e) => this.setState({ note: e.target.value })}
              />
              <Button type="primary" block loading={loading} onClick={this.handleAdd}>
                Add
              </Button>
            </div>
          }
          visible={this.state.visible}
          onVisibleChange={(visible) => this.setState({ visible })}
        >
          {children}
        </Popover>
      );
    }
    return <span onClick={this.handleAdd}>{children}</span>;
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['favorites/addFavorite'],
  };
}

export default connect(mapStateToProps)(AddFavorite);
