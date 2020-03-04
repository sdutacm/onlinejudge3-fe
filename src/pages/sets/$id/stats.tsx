import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Icon, TreeSelect, DatePicker, Button } from 'antd';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import NotFound from '@/pages/404';
import PageTitle from '@/components/PageTitle';
import PageLoading from '@/components/PageLoading';
import { Link } from 'react-router-dom';
import { urlf } from '@/utils/format';
import PageAnimation from '@/components/PageAnimation';
import { isPermissionDog } from '@/utils/permission';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import router from 'umi/router';
import PromiseQueue from 'promise-queue';
import { uniqBy } from 'lodash';
import { TreeSelectProps } from 'antd/lib/tree-select';
import { memoize } from '@/utils/decorators';
import Explanation from '@/components/Explanation';
import moment from 'moment';
import constants from '@/configs/constants';
import StatsRanklist from '@/components/StatsRanklist';
import setStatePromise from '@/utils/setStatePromise';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  detail: ISet;
  session: ISessionStatus;
}

interface State {
  gLoading: boolean;
  calcStatsLoading: boolean;
  groupsWithMembers: IGroupLiteWithMembers[];
  selectedGM: string[];
  selectedStartAt?: moment.Moment;
  selectedEndAt?: moment.Moment;
  statsRanklist: ISetStatsRanklist;
  shownStats: boolean;
  dataUpdatedAt?: number;
}

const MAX_TASK_NUM = 3;

class SetStats extends React.Component<Props, State> {
  private setStatePromise = setStatePromise.bind(this);
  private pq: PromiseQueue;
  private lastReqId: number;

  constructor(props) {
    super(props);
    this.state = {
      gLoading: false,
      calcStatsLoading: false,
      groupsWithMembers: [],
      selectedGM: [],
      selectedStartAt: undefined,
      selectedEndAt: undefined,
      statsRanklist: [],
      shownStats: false,
      dataUpdatedAt: undefined,
    };
    this.pq = new PromiseQueue(MAX_TASK_NUM, Infinity);
    this.lastReqId = 0;
  }

  @memoize
  selectedUserIdsImpl(
    selectedGM: State['selectedGM'],
    groupsWithMembers: State['groupsWithMembers'],
  ) {
    const userIds = new Set<number>();
    for (const gm of selectedGM) {
      const [g, m] = gm.split('-');
      if (!m) {
        const group = groupsWithMembers.find((group) => group.groupId === +g);
        group?.members?.forEach(
          (members) => members.user?.userId && userIds.add(members.user.userId),
        );
      } else {
        userIds.add(+m);
      }
    }
    return Array.from(userIds);
  }

  get selectedUserIds() {
    return this.selectedUserIdsImpl(this.state.selectedGM, this.state.groupsWithMembers);
  }

  @memoize
  flatProblemsImpl(sections: ISetPropsTypeStandard['sections']) {
    if (!Array.isArray(sections)) {
      return [];
    }
    const problems: Pick<IProblem, 'problemId' | 'title'>[] = [];
    sections.forEach((section) => {
      section.problems.forEach((problem) => problems.push(problem));
    });
    return problems;
  }

  get flatProblems() {
    return this.flatProblemsImpl(this.props.detail?.props?.sections);
  }

  @memoize
  userMapImpl(groupsWithMembers: State['groupsWithMembers']) {
    const userMap = new Map<number, IUserLite>();
    groupsWithMembers.forEach((group) => {
      group.members.forEach((member) => {
        const user = member.user;
        if (user) {
          userMap.set(user.userId, user);
        }
      });
    });
    return userMap;
  }

  get userMap() {
    return this.userMapImpl(this.state.groupsWithMembers);
  }

  componentDidMount(): void {
    if (this.props.session.loggedIn) {
      this.fetchAvailableGroupsWithMembers();
    }
  }

  componentWillReceiveProps(np: Readonly<Props>, nextContext: any): void {
    const p = this.props;
    if (p.session.user?.userId !== np.session.user?.userId) {
      if (np.session.loggedIn) {
        this.fetchAvailableGroupsWithMembers(np);
      } else {
        this.setState({
          groupsWithMembers: [],
        });
      }
    }
  }

  fetchAvailableGroupsWithMembers = async (props?: Props) => {
    this.lastReqId += 1;
    const reqId = this.lastReqId;
    const p = props || this.props;
    const { dispatch } = p;
    this.setState({
      gLoading: true,
    });
    try {
      const [joinedRet, favRet]: [
        IApiResponse<IFullList<IGroup>>,
        IApiResponse<IFullList<IFavorite>>,
      ] = await Promise.all([
        dispatch({
          type: 'groups/getJoinedGroups',
          payload: {},
        }),
        dispatch({
          type: 'favorites/getList',
          payload: {
            query: {
              orderDirection: 'ASC',
            },
          },
        }),
      ]);
      if (reqId !== this.lastReqId) {
        return;
      }
      const joinedGroups = joinedRet?.data || { count: 0, rows: [] };
      const favorites = favRet?.data || { count: 0, rows: [] };
      const selfGroups = joinedGroups.rows.map((g) => ({
        groupId: g.groupId,
        name: g.name,
        verified: g.verified,
        members: [],
      }));
      const favGroups = favorites.rows
        .filter((f) => f.type === 'group' && f.target)
        .map((f: IFavoriteGroup) => ({
          groupId: f.target.groupId,
          name: f.target.name,
          verified: f.target.verified,
          members: [],
        }));
      // console.log('fetchGroupMembers', selfGroups, favGroups);
      const groups = uniqBy([...selfGroups, ...favGroups], (v) => v.groupId);
      const groupMap = new Map<number, IGroupLiteWithMembers>();
      groups.forEach((g) => {
        groupMap.set(g.groupId, g);
      });
      // await sleep(8000);
      const queueTasks: Promise<void>[] = [];
      for (const group of groups) {
        queueTasks.push(
          this.pq.add(() => {
            const groupId = group.groupId;
            return dispatch({
              type: 'groups/getMembers',
              payload: {
                id: groupId,
              },
            }).then((ret: IApiResponse<IFullList<IGroupMember>>) => {
              const members = ret?.data?.rows || [];
              if (groupMap.has(groupId)) {
                groupMap.get(groupId).members = members;
              }
            });
          }),
        );
      }
      await Promise.all(queueTasks);
      this.setState({
        gLoading: false,
        groupsWithMembers: groups,
      });
    } catch (e) {
      console.error(e);
      if (reqId !== this.lastReqId) {
        return;
      }
      this.setState({
        gLoading: false,
        groupsWithMembers: [],
        selectedGM: [],
      });
    }
  };

  get gTree() {
    const data = this.state.groupsWithMembers;
    const tree: TreeSelectProps['treeData'] = data.map((d) => ({
      title: d.name,
      value: `${d.groupId}`,
      key: `${d.groupId}`,
      children: d.members.map((m) => ({
        title: m.user.nickname,
        value: `${d.groupId}-${m.user.userId}`,
        key: `${d.groupId}-${m.user.userId}`,
      })),
    }));
    return tree;
  }

  handleGMChange = (value) => {
    this.setState({ selectedGM: value });
  };

  handleCalcStats = async () => {
    tracker.event({
      category: 'sets',
      action: 'calcStats',
    });
    const selectedUserIds = this.selectedUserIds;
    const { session, dispatch } = this.props;
    const { selectedStartAt, selectedEndAt, calcStatsLoading } = this.state;
    if (calcStatsLoading) {
      return;
    }
    const userNumLimit = isPermissionDog(session)
      ? constants.setStatsUserMaxSelectPermission
      : constants.setStatsUserMaxSelect;
    if (selectedUserIds.length > userNumLimit) {
      msg.error(`Exceeded limit of ${userNumLimit} users (selected ${selectedUserIds.length})`);
      return;
    }
    try {
      await this.setStatePromise({
        calcStatsLoading: true,
        shownStats: true,
        statsRanklist: [],
        dataUpdatedAt: undefined,
      });
      router.replace({
        pathname: this.props.location.pathname,
        query: { ...this.props.location.query, page: 1 },
      });
      const ret: IApiResponse<IStatsUserAcceptedProblems> = await dispatch({
        type: 'stats/getUserAcceptedProblems',
        payload: { userIds: selectedUserIds },
      });
      msg.auto(ret);
      if (ret.success) {
        const { stats: uap, _updatedAt } = ret.data;
        const userStatsRanklist: ISetStatsRanklist = [];
        for (const userId of selectedUserIds) {
          const userStats: ISetUserStats = {
            solved: 0,
            acceptedProblemsMap: new Map<
              number,
              {
                solutionId: number;
                submittedAt: number;
              }
            >(),
          };
          const stats = uap[userId];
          if (stats) {
            for (const p of stats.problems) {
              if (!this.flatProblems.find((fp) => fp.problemId === p.pid)) {
                continue;
              }
              const submittedMoment = moment(p.at * 1000);
              if (selectedStartAt && submittedMoment.isBefore(selectedStartAt)) {
                continue;
              }
              if (selectedEndAt && submittedMoment.isAfter(selectedEndAt)) {
                continue;
              }
              userStats.acceptedProblemsMap.set(p.pid, {
                solutionId: p.sid,
                submittedAt: p.at,
              });
            }
          }
          userStats.solved = userStats.acceptedProblemsMap.size;
          userStatsRanklist.push({
            rank: 0,
            user: this.userMap.get(userId),
            stats: userStats,
          });
        }
        userStatsRanklist.sort((a, b) => b.stats.solved - a.stats.solved);
        let lastRank = 1;
        userStatsRanklist[0] && (userStatsRanklist[0].rank = lastRank);
        for (let i = 1; i < userStatsRanklist.length; ++i) {
          const row = userStatsRanklist[i];
          if (row.stats.solved === userStatsRanklist[i - 1].stats.solved) {
            row.rank = lastRank;
          } else {
            row.rank = lastRank = i + 1;
          }
        }
        this.setState({
          statsRanklist: userStatsRanklist,
          calcStatsLoading: false,
          dataUpdatedAt: _updatedAt,
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({
        calcStatsLoading: false,
      });
    }
  };

  render() {
    const { id, detail, loading, session } = this.props;
    if (loading) {
      return <PageLoading />;
    }
    if (!loading && !detail.setId) {
      return <NotFound />;
    }
    const {
      gLoading,
      selectedGM,
      statsRanklist,
      calcStatsLoading,
      shownStats,
      dataUpdatedAt,
    } = this.state;

    return (
      <PageAnimation>
        <PageTitle title={`Stats - ${detail.title}`}>
          <Row gutter={16} className="set-stats">
            <Col xs={24}>
              <h4 style={{ padding: '0 20px' }}>
                <Link to={urlf(pages.sets.detail, { param: { id } })} className="normal-text-link">
                  <Icon type="left" /> {detail.title}
                </Link>
              </h4>
            </Col>

            <Col xs={24} lg={10} xl={8}>
              <div
                className="display-flex"
                style={{ padding: '16px 20px 0', alignItems: 'center' }}
              >
                <TreeSelect
                  treeData={this.gTree}
                  value={selectedGM}
                  onChange={this.handleGMChange}
                  treeCheckable
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  searchPlaceholder={
                    gLoading ? 'Loading groups...' : 'Select groups to show statistics'
                  }
                  maxTagCount={2}
                  maxTagPlaceholder="and more..."
                  style={{ width: '100%' }}
                  disabled={gLoading}
                />
                <Explanation className="ml-lg">
                  You can only select groups you joined or favorite.
                  <br />
                  If no groups shown, go to "Groups", and then join or favorite some.
                  <br />
                  At most{' '}
                  {isPermissionDog(session)
                    ? constants.setStatsUserMaxSelectPermission
                    : constants.setStatsUserMaxSelect}{' '}
                  users will be calculated in stats.
                </Explanation>
              </div>
            </Col>

            {isPermissionDog(session) && (
              <Col xs={24} lg={10} xl={8}>
                <div style={{ padding: '16px 20px 0' }}>
                  <DatePicker.RangePicker
                    placeholder={['Start at (optional)', 'End at (optional)']}
                    defaultPickerValue={[
                      moment('2008-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
                      moment()
                        .add(1, 'd')
                        .startOf('d'),
                    ]}
                    onChange={(momentRange, _strRange) =>
                      this.setState({
                        selectedStartAt: momentRange[0],
                        selectedEndAt: momentRange[1],
                      })
                    }
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: '100%' }}
                  />
                </div>
              </Col>
            )}

            <Col xs={24} lg={4} xl={8}>
              <div style={{ padding: '16px 20px 0' }}>
                <Button type="primary" onClick={this.handleCalcStats}>
                  Show Stats
                </Button>
              </div>
            </Col>

            {shownStats && (
              <Col xs={24}>
                <Card
                  bordered={false}
                  className="list-card mt-xl set-stats-ranklist-col-bd"
                  style={{ float: 'left' }}
                >
                  <StatsRanklist
                    id={detail.setId}
                    title={detail.title}
                    data={statsRanklist}
                    dataUpdatedAt={dataUpdatedAt}
                    sections={detail.props.sections}
                    loading={calcStatsLoading}
                    showDetail={isPermissionDog(session)}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.sets.detail);
  return {
    id,
    loading: !!state.loading.effects['sets/getDetail'],
    detail: state.sets.detail[id] || {},
    session: state.session,
  };
}

export default connect(mapStateToProps)(SetStats);
