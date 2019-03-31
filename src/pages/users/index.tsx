/**
 * title: Standings
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import ToDetailCard from '@/components/ToDetailCard';
import UserBar from '@/components/UserBar';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends ReduxProps, RouteProps {
  data: IList<IUser>;
}

interface State {
}

class Standings extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  handlePageChange = page => {
    router.push({
      pathname: pages.users.index,
      query: { ...this.props.location.query, page },
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    router.push({
      pathname: pages.users.index,
      query: {
        ...this.props.location.query,
        page: 1,
        orderBy: sorter.columnKey,
        orderDirection: sorter.columnKey && sorter.order ? 'DESC' : undefined,
      },
    });
  };

  render() {
    const { loading, data: { page, count, limit, rows }, location: { query } } = this.props;
    const orderBy = query.orderBy || 'accepted';
    const orderDirection = query.orderDirection || 'DESC';
    const defaultSortOrder = orderDirection === 'DESC' ? 'descend' : 'ascend';
    return (
      <PageAnimation>
        <Row gutter={16}>
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="userId"
                loading={loading}
                pagination={false}
                className="responsive-table"
                onChange={this.handleTableChange}
              >
                <Table.Column
                  title="Rank"
                  key="Rank"
                  render={(text, record: IUser, index) => (
                    <span>{(page - 1) * limit + index + 1}</span>
                  )}
                />
                <Table.Column
                  title="User"
                  key="User"
                  render={(text, record: IUser) => (
                    <UserBar user={record} />
                  )}
                />
                <Table.Column
                  title="Accepted"
                  key="accepted"
                  sorter
                  sortOrder={orderBy === 'accepted' ? defaultSortOrder : undefined}
                  render={(text, record: IUser) => (
                    <span>{record.accepted}</span>
                  )}
                />
                <Table.Column
                  title="Rating"
                  key="rating"
                  sorter
                  sortOrder={orderBy === 'rating' ? defaultSortOrder : undefined}
                  render={(text, record: IUser) => (
                    <span>{record.rating ? record.rating : ''}</span>
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.users.list}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <ToDetailCard
                label="Go to User"
                placeholder="User ID"
                toDetailLink={id => urlf(pages.users.detail, { param: { id } })}
              />
            </Card>
            <Card bordered={false}>
              <FilterCard fields={[
                { displayName: 'Nickname', fieldName: 'nickname' },
                { displayName: 'School', fieldName: 'school' },
                { displayName: 'College', fieldName: 'college' },
                { displayName: 'Major', fieldName: 'major' },
                { displayName: 'Class', fieldName: 'class' },
              ]} />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['users/getList'],
    data: state.users.list,
  };
}

export default connect(mapStateToProps)(Standings);
