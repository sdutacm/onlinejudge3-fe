/**
 * title: Groups
 */

import React from 'react';
import { connect } from 'dva';
import { Tabs, Icon, Button, Input } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import GeneralFormModal from '@/components/GeneralFormModal';
import tracker from '@/utils/tracker';
import GroupList from '@/components/GroupList';

export interface Props extends ReduxProps, RouteProps {
  searchList: IList<IGroup>;
  joinedGroups: IFullList<IGroup>;
  session: ISessionStatus;
  searchLoading: boolean;
  joinedLoading: boolean;
}

interface State {
  search: string;
}

class GroupIndex extends React.Component<Props, State> {
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

  componentWillReceiveProps(np: Readonly<Props>): void {
    const p = this.props;
    if (np.location.query.category === 'my') {
      if (!p.session.loggedIn && np.session.loggedIn) {
        np.dispatch({
          type: 'groups/getJoinedGroups',
          payload: {},
        });
      } else if (p.session.loggedIn && !np.session.loggedIn) {
        router.replace({
          pathname: this.props.location.pathname,
          query: { category: 'explore' },
        });
      }
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
    if (!this.props.searchLoading) {
      this.state.search &&
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
      searchLoading,
      joinedLoading,
      searchList,
      joinedGroups,
      location: { query },
      session,
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
              <Button disabled={!session.loggedIn}>
                <Icon type="plus" /> Group
              </Button>
            }
          >
            <Tabs.TabPane tab="Explore" key="explore">
              <div className="mb-lg text-center" style={{ marginTop: '42px' }}>
                <Input.Search
                  enterButton={<Icon type="search" />}
                  placeholder=""
                  className="input-button-primary"
                  defaultValue={this.state.search}
                  onChange={(e) => this.setState({ search: e.target.value })}
                  style={{ maxWidth: '729px' }}
                  onSearch={this.handleSearch}
                />
              </div>
              <GroupList
                loading={searchLoading}
                count={searchList.count}
                rows={searchList.rows}
                page={searchList.page}
                limit={limits.groups.search}
                emptyText={query.name ? 'No groups' : ''}
                onPageChange={this.handlePageChange}
              />
            </Tabs.TabPane>

            {session.loggedIn && (
              <Tabs.TabPane tab="My Groups" key="my">
                <GroupList
                  loading={joinedLoading}
                  count={joinedGroups.count}
                  rows={joinedGroups.rows}
                  emptyText="No groups yet. Explore new groups just now!"
                  onPageChange={this.handlePageChange}
                />
              </Tabs.TabPane>
            )}
          </Tabs>
        </div>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    searchLoading: !!state.loading.effects['groups/searchList'],
    joinedLoading: !!state.loading.effects['groups/getJoinedGroups'],
    searchList: state.groups.search,
    joinedGroups: state.groups.joinedGroups,
    session: state.session,
  };
}

export default connect(mapStateToProps)(GroupIndex);
