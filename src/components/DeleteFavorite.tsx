import React from 'react';
import { connect } from 'dva';
import { Popconfirm } from 'antd';
import { ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';

export interface Props extends ReduxProps {
  favoriteId: number;
}

interface State {
  visible: boolean;
}

class DeleteFavorite extends React.Component<Props, State> {
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

  handleDelete = () => {
    const { dispatch, favoriteId } = this.props;
    dispatch({
      type: 'favorites/deleteFavorite',
      payload: {
        id: favoriteId,
      },
    }).then(ret => {
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
      }
    });
  };

  handleHide = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, loading } = this.props;
    return (
      <Popconfirm title="Delete this favorite?" placement="bottom" onConfirm={this.handleDelete}>
        {children}
      </Popconfirm>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['favorites/deleteFavorite'],
  };
}

export default connect(mapStateToProps)(DeleteFavorite);
