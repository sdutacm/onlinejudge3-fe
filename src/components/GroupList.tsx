import React from 'react';
import { Link } from 'react-router-dom';
import { Card, List, Icon } from 'antd';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';

interface Props {
  loading: boolean;
  count: number;
  rows: IGroup[];
  page?: number;
  limit?: number;
  emptyText?: string;
  onPageChange?: (page: number) => void;
}

interface State {}

class GroupList extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

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
                      {item.intro}
                      <div className="mt-sm">
                        <Icon type="user" /> {item.membersCount}
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

export default GroupList;
