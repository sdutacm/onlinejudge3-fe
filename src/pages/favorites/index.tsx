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
  receivedLoading: boolean;
  received: IList<IFavorite>;
  sentLoading: boolean;
  sent: IList<IFavorite>;
}

interface State {
}

class FavoriteListPage extends React.Component<Props, State> {
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
    const { receivedLoading, received, sentLoading, sent, location: { query }, dispatch } = this.props;
    const isReceived = query.type === 'received';
    const loading = isReceived ? receivedLoading : sentLoading;
    const data = isReceived ? received : sent;
    return (
      <PageAnimation>
        <Row gutter={16}>
          <Col xs={24}>
            <Tabs defaultActiveKey={query.type} activeKey={query.type} animated={false} onChange={this.handleTypeChange}>
              <Tabs.TabPane tab="Received" key="received" />
              <Tabs.TabPane tab="Sent" key="sent" />
            </Tabs>
          </Col>
          <Col xs={24}>
            <Card bordered={false} className="list-card">

              <Pagination
                className="ant-table-pagination"
                total={data.count}
                current={data.page}
                pageSize={limits.messages.list}
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
    receivedLoading: !!state.loading.effects['messages/getReceivedList'],
    received: state.messages.received,
    sentLoading: !!state.loading.effects['messages/getSentList'],
    sent: state.messages.sent,
  };
}

export default connect(mapStateToProps)(FavoriteListPage);
