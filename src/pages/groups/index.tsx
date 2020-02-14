/**
 * name: Groups
 * intro: '介绍，这是介绍...',
 */

import React from 'react';
import { connect } from 'dva';
import { Card, Tabs, Icon, Button, List, Input } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';
import constants from '@/configs/constants';
import PageAnimation from '@/components/PageAnimation';
import GeneralFormModal from '@/components/GeneralFormModal';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps, RouteProps {
  searchList: IList<IGroup>;
  myGroups: IFullList<IGroup>;
  session: ISessionStatus;
}

interface State {
  search: string;
}

class GroupList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      search: props.location.query.name || '',
    };
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (
      this.props.session.loggedIn &&
      !nextProps.session.loggedIn &&
      nextProps.location.query.joined
    ) {
      // router.replace({
      //   pathname: this.props.location.pathname,
      //   query: { ...this.props.location.query, joined: undefined, page: 1 },
      // });
    }
  }

  handleCategoryChange = (category) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { category },
    });
  };

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleSearch = () => {
    if (this.state.search) {
      tracker.event({
        category: 'groups',
        action: 'search',
        label: this.state.search,
      });
      router.replace({
        pathname: this.props.location.pathname,
        query: { ...this.props.location.query, name: this.state.search, page: 1 },
      });
    }
  };

  render() {
    const {
      loading,
      searchList: { page, count, rows },
      location: { query },
    } = this.props;
    return (
      <PageAnimation>
        <div className="content-view-xl full-width-inner-content">
          <Tabs
            defaultActiveKey={query.category}
            activeKey={query.category || 'explore'}
            animated={false}
            onChange={this.handleCategoryChange}
            tabBarExtraContent={
              <Button>
                <Icon type="plus" /> Group
              </Button>
            }
          >
            <Tabs.TabPane tab="Explore" key="explore">
              <div className="mb-lg text-center" style={{ marginTop: '42px' }}>
                <Input.Search
                  enterButton="Search"
                  placeholder=""
                  className="input-button-primary"
                  defaultValue={this.state.search}
                  onChange={(e) => this.setState({ search: e.target.value })}
                  style={{ maxWidth: '729px' }}
                  disabled={loading}
                  onSearch={this.handleSearch}
                />
              </div>
              <List
                className="group-card-list"
                grid={{
                  gutter: 16,
                  xs: 1,
                  md: 4,
                }}
                dataSource={rows}
                locale={{ emptyText: query.name ? 'No groups' : '' }}
                loading={loading}
                pagination={
                  count > 0
                    ? {
                        // className: 'ant-table-pagination',
                        total: count,
                        current: +page || 1,
                        pageSize: limits.groups.search,
                        onChange: this.handlePageChange,
                      }
                    : undefined
                }
                renderItem={(item) => (
                  <List.Item>
                    <Card bordered={false} style={{ width: '100%' }}>
                      <Card.Meta
                        title={
                          <div>
                            <div
                              className="text-ellipsis"
                              style={{ paddingRight: '16px' }}
                            >
                              {item.name}
                            </div>
                            {item.verified ? (
                              <div
                                className="verified-badge"
                                style={{
                                  position: 'absolute',
                                  top: '12px',
                                  right: '16px',
                                }}
                                title="Verified"
                              >
                                V
                              </div>
                            ) : null}
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
                  </List.Item>
                )}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="My Groups" key="my" />
          </Tabs>
        </div>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['groups/searchList'],
    searchList: state.groups.search,
    session: state.session,
  };
}

export default connect(mapStateToProps)(GroupList);
