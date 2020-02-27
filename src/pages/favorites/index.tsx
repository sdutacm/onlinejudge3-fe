/**
 * title: Favorites
 */

import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Icon, List } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import ProblemBar from '@/components/ProblemBar';
import TimeBar from '@/components/TimeBar';
import DeleteFavorite from '@/components/DeleteFavorite';

export interface Props extends ReduxProps, RouteProps {
  loading: boolean;
  data: IList<IFavorite>;
}

interface State {}

class FavoriteListPage extends React.Component<Props, State> {
  // constructor(props) {
  //   super(props);
  // }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleTypeChange = (type) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, type, page: 1 },
    });
  };

  render() {
    const {
      loading,
      data,
      location: { query },
      dispatch,
    } = this.props;
    return (
      <PageAnimation>
        <Row gutter={16}>
          {/* <Col xs={24}>
            <Tabs defaultActiveKey={query.type} activeKey={query.type} animated={false} onChange={this.handleTypeChange}>
              <Tabs.TabPane tab="Problems" key="problems" />
            </Tabs>
          </Col> */}
          <Col xs={24}>
            <Card bordered={false} className="">
              <List
                className="favorite-list"
                itemLayout="horizontal"
                loading={loading}
                locale={{ emptyText: 'No Favorites' }}
                dataSource={data.rows}
                renderItem={(item: IFavorite) => {
                  switch (item.type) {
                    case 'problem':
                      return (
                        <List.Item
                          className="hover-visible-container"
                          actions={[
                            <DeleteFavorite key={item.favoriteId} favoriteId={item.favoriteId}>
                              <a key="action-delete" className="hover-visible">
                                <Icon type="delete" />
                              </a>
                            </DeleteFavorite>,
                          ]}
                        >
                          <List.Item.Meta
                            title={<ProblemBar problem={item.target} display="id-title" />}
                            description={<pre>{item.note}</pre>}
                          />
                          <TimeBar time={item.createdAt * 1000} />
                        </List.Item>
                      );
                  }
                  return (
                    <List.Item
                      className="hover-visible-container"
                      actions={[
                        <DeleteFavorite key={item.favoriteId} favoriteId={item.favoriteId}>
                          <a key="action-delete" className="hover-visible">
                            <Icon type="delete" />
                          </a>
                        </DeleteFavorite>,
                      ]}
                    >
                      <List.Item.Meta
                        title={item.target.title}
                        description={<pre>{item.note}</pre>}
                      />
                      <TimeBar time={item.createdAt * 1000} />
                    </List.Item>
                  );
                }}
                pagination={{
                  className: 'ant-table-pagination',
                  total: data.count,
                  current: query.page || 1,
                  pageSize: limits.topics.replies,
                  onChange: this.handlePageChange,
                }}
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
    loading: !!state.loading.effects['favorites/getList'],
    data: state.favorites.list,
  };
}

export default connect(mapStateToProps)(FavoriteListPage);
