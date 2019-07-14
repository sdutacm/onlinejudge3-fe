/**
 * title: Topics
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Form, Row, Col, Card, Affix, Button } from 'antd';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import ProblemBar from '@/components/ProblemBar';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends ReduxProps, RouteProps {
  data: IList<ITopic>;
  session: ISessionStatus;
}

interface State {
}

class TopicList extends React.Component<Props, State> {
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
      loading, data: { page, count, rows }, session, location: { query },
    } = this.props;
    return (
      <PageAnimation>
        <Row gutter={16}>
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="topicId"
                loading={loading}
                onChange={this.handleTableChange}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="Topic"
                  key="Title"
                  render={(text, record: ITopic) => (
                    <Link to={urlf(pages.topics.detail, { param: { id: record.topicId } })}>{record.title}</Link>
                  )}
                />
                {!query.problemId && <Table.Column
                  title="Problem"
                  key="Problem"
                  render={(text, record: ITopic) => (
                    record.problem ? <ProblemBar problem={record.problem} /> : null
                  )}
                />}
                <Table.Column
                  title="Author"
                  key="Author"
                  render={(text, record: ITopic) => (
                    record.user ? <UserBar user={record.user} /> : null
                  )}
                />
                <Table.Column
                  title="At"
                  key="Time"
                  render={(text, record: ITopic) => (
                    <TimeBar time={record.createdAt * 1000} />
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.topics.list}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            {/*<Card bordered={false}>*/}
            {/*  {!session.loggedIn*/}
            {/*    ? <Button type="primary" block disabled>登录后发帖</Button>*/}
            {/*    : <CreateTopicModal*/}
            {/*      type={query.type === 'solution' ? 'solution' : 'topic'}*/}
            {/*      problemId={query.problemId}*/}
            {/*      location={location}*/}
            {/*    >*/}
            {/*      <Button type="primary" block>{query.type === 'solution' ? '发表题解' : '发帖'}</Button>*/}
            {/*    </CreateTopicModal>}*/}
            {/*</Card>*/}
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Title', fieldName: 'title' },
                ]}
                initQuery={{ type: query.type, problemId: query.problemId }}
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
    loading: !!state.loading.effects['topics/getList'],
    data: state.topics.list,
    session: state.session,
  };
}

export default connect(mapStateToProps)(TopicList);
