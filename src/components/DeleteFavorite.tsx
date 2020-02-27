import React from 'react';
import { connect } from 'dva';
import { Popconfirm } from 'antd';
import { ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import { PopoverProps } from 'antd/lib/popover';

export interface Props extends ReduxProps {
  favoriteId: number;
  placement?: PopoverProps['placement'];
  silent?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface State {
  visible: boolean;
}

class DeleteFavorite extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    placement: 'bottom',
    silent: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount(): void {
    this.props.dispatch({
      type: 'problems/getTagList',
    });
  }

  handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    const { dispatch, favoriteId, loading } = this.props;
    if (loading) {
      return;
    }
    dispatch({
      type: 'favorites/deleteFavorite',
      payload: {
        id: favoriteId,
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
        msg.success('Deleted from favorites');
        this.handleHide();
        tracker.event({
          category: 'favorites',
          action: 'delete',
        });
      }
    });
  };

  handleHide = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, placement, silent, className, style } = this.props;
    if (!silent) {
      return (
        <Popconfirm
          title="Delete this favorite?"
          placement={placement}
          onConfirm={this.handleDelete}
        >
          {children}
        </Popconfirm>
      );
    }
    return (
      <span className={className} style={style} onClick={this.handleDelete}>
        {children}
      </span>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['favorites/deleteFavorite'],
  };
}

export default connect(mapStateToProps)(DeleteFavorite);
