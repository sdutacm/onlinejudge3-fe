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
import { groupJoinChannels, GroupJoinChannel } from '@/configs/groups';
import { checkPerms } from '@/utils/permission';
import msg from '@/utils/msg';
import pages from '@/configs/pages';
import { urlf } from '@/utils/format';
import ImportGroupModal from '@/components/ImportGroupModal';
import { EPerm } from '@/common/configs/perm.config';

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

  get groupDetailFormItems() {
    const { session } = this.props;
    const items = [
      {
        name: 'Name',
        field: 'name',
        component: 'input',
        initialValue: '',
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'Intro',
        field: 'intro',
        component: 'input',
        initialValue: '',
      },
      {
        name: 'Private',
        field: 'private',
        component: 'select',
        initialValue: 'false',
        options: [
          {
            value: true,
            name: 'Yes',
          },
          {
            value: false,
            name: 'No',
          },
        ],
        rules: [{ required: true }],
      },
      {
        name: 'Join Channel',
        field: 'joinChannel',
        component: 'select',
        initialValue: `${GroupJoinChannel.Any}`,
        options: groupJoinChannels.map((jc) => ({
          value: jc.id,
          name: jc.name,
        })),
        rules: [{ required: true }],
      },
    ];
    if (checkPerms(session, EPerm.WriteGroup)) {
      items.splice(2, 0, {
        name: 'Verified',
        field: 'verified',
        component: 'select',
        initialValue: 'false',
        options: [
          {
            value: true,
            name: 'Yes',
          },
          {
            value: false,
            name: 'No',
          },
        ],
        rules: [{ required: true }],
      });
    }
    return items;
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
              <div>
                {checkPerms(session, EPerm.WriteGroup) && (
                  <ImportGroupModal>
                    <Button className="mr-md">
                      <Icon type="import" /> Import
                    </Button>
                  </ImportGroupModal>
                )}
                <GeneralFormModal
                  loadingEffect="groups/addGroup"
                  title="Create Group"
                  autoMsg
                  items={this.groupDetailFormItems}
                  submit={(dispatch: ReduxProps['dispatch'], values) => {
                    tracker.event({
                      category: 'groups',
                      action: 'createGroup',
                    });
                    const data = {
                      ...values,
                      private: values.private === 'true',
                      joinChannel: +values.joinChannel,
                    };
                    values.verified && (data.verified = values.verified === 'true');
                    return dispatch({
                      type: 'groups/addGroup',
                      payload: {
                        data,
                      },
                    });
                  }}
                  onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse) => {
                    msg.success('Create group successfully');
                  }}
                  onSuccessModalClosed={(
                    dispatch: ReduxProps['dispatch'],
                    ret: IApiResponse<{ groupId: number }>,
                  ) => {
                    if (ret.success) {
                      dispatch({
                        type: 'groups/clearAllJoinedGroups',
                        payload: {},
                      });
                      router.push(urlf(pages.groups.detail, { param: { id: ret.data.groupId } }));
                    }
                  }}
                >
                  <Button disabled={!session.loggedIn}>
                    <Icon type="plus" /> Group
                  </Button>
                </GeneralFormModal>
              </div>
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
