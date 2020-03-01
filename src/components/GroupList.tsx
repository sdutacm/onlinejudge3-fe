import React from 'react';
import { connect } from 'dva';
import { Link } from 'react-router-dom';
import { Card, List, Icon } from 'antd';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import { ReduxProps } from '@/@types/props';
import AddFavorite from './AddFavorite';
import DeleteFavorite from './DeleteFavorite';

interface Props extends ReduxProps {
  loading: boolean;
  count: number;
  rows: IGroup[];
  page?: number;
  limit?: number;
  emptyText?: string;
  onPageChange?: (page: number) => void;
  favorites: IFullList<IFavorite>;
  session: ISessionStatus;
}

interface State {}

class GroupList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  renderFavoriteButton = (groupId: number) => {
    const {
      favorites: { rows: favoritesRows },
      session,
    } = this.props;
    if (!session.loggedIn) {
      return null;
    }
    const favorite = favoritesRows.find((v) => v.type === 'group' && v.target?.groupId === groupId);
    if (!favorite) {
      return (
        <AddFavorite
          type="group"
          id={groupId}
          silent
          style={{ paddingLeft: '4px', fontSize: '16px' }}
        >
          <Icon type="star" theme="outlined" />
        </AddFavorite>
      );
    } else {
      return (
        <DeleteFavorite
          favoriteId={favorite.favoriteId}
          silent
          style={{ paddingLeft: '4px', fontSize: '16px' }}
        >
          <Icon type="star" theme="filled" />
        </DeleteFavorite>
      );
    }
  };

  render() {
    const { count, rows, page, limit, loading, emptyText, onPageChange } = this.props;

    return (
      <List
        className="group-card-list"
        grid={{
          gutter: 16,
          xs: 1,
          md: 4,
        }}
        dataSource={rows}
        locale={{ emptyText }}
        loading={loading}
        pagination={
          count && page && limit
            ? {
                // className: 'ant-table-pagination',
                total: count,
                current: +page || 1,
                pageSize: limit,
                onChange: onPageChange,
              }
            : undefined
        }
        renderItem={(item: IGroup) => (
          <List.Item>
            <Link
              to={urlf(pages.groups.detail, { param: { id: item.groupId } })}
              style={{ width: '100%' }}
            >
              <Card bordered={false} hoverable>
                <Card.Meta
                  title={
                    <div className="display-flex">
                      <div className="text-ellipsis">{item.name}</div>
                      {item.verified && (
                        <div className="verified-badge ml-sm-md" title="Verified">
                          V
                        </div>
                      )}
                    </div>
                  }
                  description={
                    <div className="text-ellipsis">
                      <div>{item.intro || '　'}</div>
                      <div
                        className="mt-sm flex-justify-space-between"
                        style={{ alignItems: 'center' }}
                      >
                        <span style={{ lineHeight: '2' }}>
                          <Icon type="user" /> {item.membersCount}
                        </span>
                        {this.renderFavoriteButton(item.groupId)}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Link>
          </List.Item>
        )}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    favorites: state.favorites.list,
    session: state.session,
  };
}

export default connect(mapStateToProps)(GroupList);
