/**
 * title: Posts
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card } from 'antd';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends ReduxProps, RouteProps {
  data: IList<IPost>;
  session: ISessionStatus;
}

interface State {
}

class PostList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  handlePageChange = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleTableChange = (e) => {
    console.log(e);
  };

  render() {
    const {
      loading, data: { page, count, rows },
    } = this.props;
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="postId"
                loading={loading}
                onChange={this.handleTableChange}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: IPost) => (
                    <Link to={urlf(pages.posts.detail, { param: { id: record.postId } })}>{record.title}</Link>
                  )}
                />
                {/* <Table.Column
                  title="Author"
                  key="Author"
                  render={(text, record: IPost) => (
                    <UserBar user={record.user} />
                  )}
                /> */}
                <Table.Column
                  title="At"
                  key="Time"
                  render={(text, record: IPost) => (
                    <TimeBar time={record.createdAt * 1000} />
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.posts.list}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>

          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Title', fieldName: 'title' },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['posts/getList'],
    data: state.posts.list,
  };
}

export default connect(mapStateToProps)(PostList);
