import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Tabs, Popover, Icon, Form, Switch } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import { ReduxProps, RouteProps } from '@/@types/props';
import MessageList from '@/components/MessageList';

interface Props extends ReduxProps, RouteProps {
  receivedLoading: boolean;
  received: IList<IMessage>;
}

interface State {
}

class MessageListPage extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  handleChangePage = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleChangeType = type => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, type, page: 1 },
    });
  };

  render() {
    const { receivedLoading, received, location: { query }, dispatch } = this.props;
    return (
      <Row gutter={16}>
        <Col xs={24}>
          <Tabs defaultActiveKey={query.type} activeKey={query.type} animated={false} onChange={this.handleChangeType}>
            <Tabs.TabPane tab="Received" key="received" />
            {/*<Tabs.TabPane tab="sent" key="1" />*/}
          </Tabs>
        </Col>
        <Col xs={24}>
          <Card bordered={false} className="list-card">
            <MessageList count={received.count} rows={received.rows} dispatch={dispatch} loading={receivedLoading} />
            <Pagination
              className="ant-table-pagination"
              total={received.count}
              current={received.page}
              pageSize={limits.messages.list}
              onChange={this.handleChangePage}
            />
          </Card>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  return {
    receivedLoading: !!state.loading.effects['messages/getUnreadList'],
    received: state.messages.received,
  };
}

export default connect(mapStateToProps)(MessageListPage);
