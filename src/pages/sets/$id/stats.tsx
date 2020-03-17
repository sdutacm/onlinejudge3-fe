import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Icon, TreeSelect, DatePicker, Button, Radio } from 'antd';
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
import locale from 'antd/es/date-picker/locale/en_US';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  detail: ISet;
  uap: IStatsUserAcceptedProblems;
  session: ISessionStatus;
}

interface State {
  gLoading: boolean;
  calcStatsLoading: boolean;
  groupsWithMembers: IGroupLiteWithMembers[];
  selectedGM: string[];
  selectedStartAt?: moment.Moment;
  selectedEndAt?: moment.Moment;
  selectedSection: number | '$all';
  lastSelectedStartAt?: moment.Moment;
  lastSelectedEndAt?: moment.Moment;
  statsRanklist: ISetStatsRanklist;
  shownStats: boolean;
  uapUpdatedAt?: number;
}

interface IFlatProblem {
  id: string;
  problemId: number;
  title: string;
}

function getInitialState(): State {
  return {
    gLoading: false,
    calcStatsLoading: false,
    groupsWithMembers: [],
    selectedGM: [],
    selectedStartAt: undefined,
    selectedEndAt: undefined,
    selectedSection: '$all',
    lastSelectedStartAt: undefined,
    lastSelectedEndAt: undefined,
    statsRanklist: [],
    shownStats: false,
    uapUpdatedAt: undefined,
  };
}

function calcStatsRanklist(
  flatProblems: IFlatProblem[],
  userMap: Map<number, IUserLite>,
  uap: IStatsUserAcceptedProblems,
  selectedUserIds: IUser['userId'][],
  selectedStartAt?: moment.Moment,
  selectedEndAt?: moment.Moment,
): ISetStatsRanklist {
  try {
    const { stats: uapStats } = uap;
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
        >(), // AC 题目的映射，仅包含在 Set 中的题目
      };
      const stats = uapStats[userId];
      if (stats) {
        for (const p of stats.problems) {
          if (!flatProblems.find((fp) => fp.problemId === p.pid)) {
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
        user: userMap.get(userId),
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
    return userStatsRanklist;
  } catch (e) {
    console.error(e);
    return [];
  }
}

const MAX_TASK_NUM = 5;
let cachedSetId: number;
let cachedState = getInitialState();

class SetStats extends React.Component<Props, State> {
  private setStatePromise = setStatePromise.bind(this);
  private pq: PromiseQueue;
  private lastReqId: number;

  constructor(props) {
    super(props);
    this.state = cachedSetId === props.id ? cachedState : getInitialState();
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
  selectedGroupsWithMembersImpl(
    selectedGM: State['selectedGM'],
    groupsWithMembers: State['groupsWithMembers'],
  ) {
    const selected: IGroupLiteWithMembers[] = [];
    for (const gm of selectedGM) {
      const [g, m] = gm.split('-');
      if (!m) {
        const group = groupsWithMembers.find((group) => group.groupId === +g);
        if (group) {
          selected.push(group);
        }
      }
    }
    return selected;
  }

  get selectedGroupsWithMembers() {
    return this.selectedGroupsWithMembersImpl(this.state.selectedGM, this.state.groupsWithMembers);
  }

  @memoize
  flatProblemsImpl(sections: ISetPropsTypeStandard['sections']): IFlatProblem[] {
    if (!Array.isArray(sections)) {
      return [];
    }
    const flatProblems: IFlatProblem[] = [];
    sections.forEach((section, sectionIndex) => {
      section.problems.forEach((problem, problemIndex) =>
        flatProblems.push({
          id: `${sectionIndex + 1}-${problemIndex + 1}`,
          ...problem,
        }),
      );
    });
    return flatProblems;
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
    this.props.id && (cachedSetId = this.props.id);
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
    if (p.id !== np.id && np.id) {
      cachedSetId = this.props.id;
    }
  }

  componentWillUnmount() {
    cachedState = this.state;
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

  handleSectionChange = (e) => {
    this.setState({ selectedSection: e.target.value });
    router.replace({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page: undefined },
    });
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
      const _startAt = Date.now();
      await this.setStatePromise({
        calcStatsLoading: true,
        shownStats: true,
        statsRanklist: [],
        uapUpdatedAt: undefined,
        lastSelectedStartAt: selectedStartAt,
        lastSelectedEndAt: selectedEndAt,
      });
      router.replace({
        pathname: this.props.location.pathname,
        query: { ...this.props.location.query, page: undefined },
      });
      const ret: IApiResponse<IStatsUserAcceptedProblems> = await dispatch({
        type: 'stats/getUserAcceptedProblems',
        payload: { userIds: selectedUserIds },
      });
      msg.auto(ret);
      if (ret.success) {
        const userStatsRanklist = calcStatsRanklist(
          this.flatProblems,
          this.userMap,
          ret.data,
          this.selectedUserIds,
          selectedStartAt,
          selectedEndAt,
        );
        this.setState({
          statsRanklist: userStatsRanklist,
          calcStatsLoading: false,
          uapUpdatedAt: ret.data._updatedAt,
        });
        tracker.timing({
          category: 'sets',
          variable: 'calcStats',
          value: Date.now() - _startAt,
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({
        calcStatsLoading: false,
      });
    }
  };

  handleCalcStatsPerGroup = () => {
    const { uap } = this.props;
    const { selectedStartAt, selectedEndAt } = this.state;
    const groupStats: ISetStatsGroupRanklist[] = [];
    for (const group of this.selectedGroupsWithMembers) {
      const userStatsRanklist = calcStatsRanklist(
        this.flatProblems,
        this.userMap,
        uap,
        [...group.members.map((member) => member.user.userId)],
        selectedStartAt,
        selectedEndAt,
      );
      groupStats.push({
        groupId: group.groupId,
        name: group.name,
        verified: group.verified,
        ranklist: userStatsRanklist,
      });
    }
    return groupStats;
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
      uapUpdatedAt,
      selectedStartAt,
      selectedEndAt,
      selectedSection,
      lastSelectedStartAt,
      lastSelectedEndAt,
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
                  <DatePicker
                    placeholder="End at (optional)"
                    defaultPickerValue={moment()
                      .add(1, 'd')
                      .startOf('d')}
                    onChange={(moment, _str) =>
                      this.setState({
                        selectedEndAt: moment,
                      })
                    }
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    value={selectedEndAt}
                    style={{ width: '100%' }}
                    locale={{
                      ...locale,
                      lang: {
                        ...locale.lang,
                        ok: 'OK',
                        timeSelect: 'Select time',
                        dateSelect: 'Select date',
                      },
                    }}
                  />
                  {/* <DatePicker.RangePicker
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
                    value={[selectedStartAt, selectedEndAt]}
                    style={{ width: '100%' }}
                    locale={{
                      ...locale,
                      lang: {
                        ...locale.lang,
                        ok: 'OK',
                        timeSelect: 'Select time',
                        dateSelect: 'Select date',
                      },
                    }}
                  /> */}
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
                <div style={{ padding: '16px 20px 0' }}>
                  <Radio.Group onChange={this.handleSectionChange} value={selectedSection}>
                    <Radio.Button className="mt-md" value="$all">
                      All
                    </Radio.Button>
                    {(detail.props as ISetPropsTypeStandard).sections.map((section, index) => (
                      <Radio.Button
                        className="mt-md"
                        key={`${detail.setId}-$${index}`}
                        value={index}
                      >
                        {section.title}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </div>
              </Col>
            )}

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
                    sections={detail.props.sections}
                    // userMap={this.userMap}
                    // selectedGroups={this.selectedGroupsWithMembers}
                    // selectedUserIds={this.selectedUserIds}
                    data={statsRanklist}
                    uapUpdatedAt={uapUpdatedAt}
                    selectedStartAt={lastSelectedStartAt}
                    selectedEndAt={lastSelectedEndAt}
                    selectedSection={selectedSection}
                    loading={calcStatsLoading}
                    showDetail={isPermissionDog(session)}
                    calcStatsPerGroup={this.handleCalcStatsPerGroup}
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
    uap: state.stats.userAcceptedProblems,
    session: state.session,
  };
}

export default connect(mapStateToProps)(SetStats);
