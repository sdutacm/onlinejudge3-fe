/**
 * title: Favorites
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Tabs, Popover, Icon, Form, Switch } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import { ReduxProps, RouteProps } from '@/@types/props';
import FavoriteList from '@/components/MessageList';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends ReduxProps, RouteProps {
  loading: boolean;
  data: IList<IFavorite>;
}

interface State {
}

class FavoriteListPage extends React.Component<Props, State> {
  constructor(props) {
    super(props);
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

  handleTypeChange = type => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, type, page: 1 },
    });
  };

  render() {
    const { loading, data, location: { query }, dispatch } = this.props;
    return (
      <PageAnimation>
        <Row gutter={16}>
          <Col xs={24}>
            <Tabs defaultActiveKey={query.type} activeKey={query.type} animated={false} onChange={this.handleTypeChange}>
              <Tabs.TabPane tab="Problems" key="problems" />
            </Tabs>
          </Col>
          <Col xs={24}>
            <Card bordered={false} className="list-card">

              <Pagination
                className="ant-table-pagination"
                total={data.count}
                current={data.page}
                pageSize={limits.favorites.list}
                onChange={this.handlePageChange}
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
