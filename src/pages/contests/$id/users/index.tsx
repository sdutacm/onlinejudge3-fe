/**
 * title: Contest Users
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Icon } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import FilterCard from '@/components/FilterCard';
import PageAnimation from '@/components/PageAnimation';
import { isAdminDog } from '@/utils/permission';
import GeneralFormModal from '@/components/GeneralFormModal';
import msg from '@/utils/msg';
import { matchPath } from 'react-router';
import { get as safeGet } from 'lodash';
import { getPathParamId } from '@/utils/getPathParams';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  data: IList<IContestUser>;
  session: ISessionStatus;
  contestUser: IContestUser;
  contestDetail: IContest;
}

interface State {}

class ContestUserList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleTableChange = (e) => {
    console.log(e);
  };

  editContestUser = (uid) => {
    const { dispatch, id } = this.props;
    const matchDetail = matchPath(this.props.location.pathname, {
      path: pages.contests.users,
      exact: true,
    });
    if (matchDetail) {
      dispatch({
        type: 'contests/getContestUser',
        payload: {
          id,
          uid,
        },
      });
    }
  };

  addUserFormItems = (contestUser, uid) => {
    return [
      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        initialValue: contestUser[uid].nickname,
        rules: [{ required: true, message: 'Please input nickname' }],
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        initialValue: contestUser[uid].password,
        rules: [{ required: true, message: 'Please input password' }],
      },
      {
        name: 'Unofficial Participation',
        field: 'unofficial',
        component: 'select',
        initialValue: String(contestUser[uid].unofficial),
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Name',
        field: 'name1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].name'),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No.',
        field: 'schoolNo1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].schoolNo'),
      },
      {
        name: 'School',
        field: 'school1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].school'),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College',
        field: 'college1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].college'),
      },
      {
        name: 'Major',
        field: 'major1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].major'),
      },
      {
        name: 'Class',
        field: 'class1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].class'),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel',
        field: 'tel1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].tel'),
      },
      {
        name: 'Email',
        field: 'email1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].email'),
        rules: [{ required: true, message: 'Please input email' }],
      },
      {
        name: 'Clothing',
        field: 'clothing1',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[0].clothing'),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
    ];
  };
  addTeamUserFormItems = (contestUser, uid) => {
    return [
      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        initialValue: contestUser[uid].nickname,
        rules: [{ required: true, message: 'Please input nickname' }],
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        initialValue: contestUser[uid].password,
        rules: [{ required: true, message: 'Please input password' }],
      },
      {
        name: 'Unofficial Participation',
        field: 'unofficial',
        component: 'select',
        initialValue: String(contestUser[uid].unofficial),
        options: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
      {
        name: 'Name of Member 1',
        field: 'name1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].name'),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 1',
        field: 'schoolNo1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].schoolNo'),
      },
      {
        name: 'School of Member 1',
        field: 'school1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].school'),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 1',
        field: 'college1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].college'),
      },
      {
        name: 'Major of Member 1',
        field: 'major1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].major'),
      },
      {
        name: 'Class of Member 1',
        field: 'class1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].class'),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 1',
        field: 'tel1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].tel'),
      },
      {
        name: 'Email of Member 1',
        field: 'email1',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[0].email'),
        rules: [{ required: true, message: 'Please input email' }],
      },
      {
        name: 'Clothing of Member 1',
        field: 'clothing1',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[0].clothing'),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 2',
        field: 'name2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].name'),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 2',
        field: 'schoolNo2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].schoolNo'),
      },
      {
        name: 'School of Member 2',
        field: 'school2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].school'),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 2',
        field: 'college2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].college'),
      },
      {
        name: 'Major of Member 2',
        field: 'major2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].major'),
      },
      {
        name: 'Class of Member 2',
        field: 'class2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].class'),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 2',
        field: 'tel2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].tel'),
      },
      {
        name: 'Email of Member 2',
        field: 'email2',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[1].email'),
      },
      {
        name: 'Clothing of Member 2',
        field: 'clothing2',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[1].clothing'),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 3',
        field: 'name3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].name'),
        rules: [{ required: true, message: 'Please input name' }],
      },
      {
        name: 'School No. of Member 3',
        field: 'schoolNo3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].schoolNo'),
      },
      {
        name: 'School of Member 3',
        field: 'school3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].school'),
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College of Member 3',
        field: 'college3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].college'),
      },
      {
        name: 'Major of Member 3',
        field: 'major3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].major'),
      },
      {
        name: 'Class of Member 3',
        field: 'class3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].class'),
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel of Member 3',
        field: 'tel3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].tel'),
      },
      {
        name: 'Email of Member 3',
        field: 'email3',
        component: 'input',
        initialValue: safeGet(contestUser[uid], 'members[2].email'),
      },
      {
        name: 'Clothing of Member 3',
        field: 'clothing3',
        component: 'select',
        initialValue: safeGet(contestUser[uid], 'members[2].clothing'),
        options: this.clothingSize.map((item) => ({
          value: item,
          name: item,
        })),
      },
    ];
  };

  clothingSize = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  formList = [
    'schoolNo',
    'name',
    'school',
    'college',
    'major',
    'class',
    'tel',
    'email',
    'clothing',
  ];

  render() {
    const {
      loading,
      data: { page, count, rows },
      id,
      contestUser,
      contestDetail,
      session,
      location: { query },
    } = this.props;

    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    const regInProgress =
      contestDetail.registerStartAt * 1000 <= serverTime &&
      serverTime < contestDetail.registerEndAt * 1000;

    let this_ = this;
    return (
      <PageAnimation>
        <Row gutter={16}>
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="contestUserId"
                loading={loading}
                onChange={this.handleTableChange}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title=""
                  key="unofficial"
                  render={(text, user: IContestUser) => {
                    if (user.unofficial) {
                      return '*';
                    } else {
                      return '';
                    }
                  }}
                />
                <Table.Column title="ID" key="contestUserId" dataIndex="contestUserId" />
                <Table.Column title="Username" key="username" dataIndex="username" />
                <Table.Column title="Nickname" key="nickname" dataIndex="nickname" />
                <Table.Column
                  title="Info"
                  key="info"
                  render={(text, user: IContestUser) => {
                    return user.members.map((item) => {
                      let str = [item.name, item.school, item.class]
                        .filter((item) => item)
                        .join(' | ');
                      return (
                        <span key={str}>
                          {str}
                          <br />
                        </span>
                      );
                    });
                  }}
                />
                <Table.Column
                  title="Status"
                  key="status"
                  render={(text, user: IContestUser) => {
                    if (user.status === 0) {
                      return (
                        <span>
                          <Icon type="question" /> Pending
                        </span>
                      );
                    }
                    if (user.status === 1) {
                      return (
                        <span>
                          <Icon type="check" /> Accepted
                        </span>
                      );
                    }
                    if (user.status === 2) {
                      return (
                        <span>
                          <Icon type="exclamation" /> Modification Required
                        </span>
                      );
                    }
                    if (user.status === 3) {
                      return (
                        <span>
                          <Icon type="close" /> Rejected
                        </span>
                      );
                    }
                  }}
                />
                <Table.Column
                  title=""
                  key="actions"
                  render={(text, user: IContestUser) => {
                    if (
                      (regInProgress &&
                        this.props.session.loggedIn &&
                        user.username === session.user.username) ||
                      isAdminDog(session)
                    ) {
                      return (
                        <span>
                          <GeneralFormModal
                            loadingEffect="contests/updateContestUser"
                            title="Edit Register Info"
                            autoMsg
                            items={
                              contestUser[text.contestUserId]
                                ? text.members.length === 3
                                  ? this_.addTeamUserFormItems(contestUser, text.contestUserId)
                                  : this_.addUserFormItems(contestUser, text.contestUserId)
                                : []
                            }
                            submit={(dispatch: ReduxProps['dispatch'], values) => {
                              let data = {};
                              data['nickname'] = values['nickname'];
                              data['password'] = values['password'];
                              data['unofficial'] = values['unofficial'] === 'false' ? false : true;
                              let members = [];
                              if (text.members.length === 3) {
                                members = [{}, {}, {}];
                                for (let i = 0; i < 3; i++) {
                                  for (let j = 0; j < this.formList.length; j++) {
                                    members[i][this.formList[j]] =
                                      values[this.formList[j] + (i + 1)];
                                  }
                                }
                              } else {
                                members = [{}];
                                for (let j = 0; j < this.formList.length; j++) {
                                  members[0][this.formList[j]] = values[this.formList[j] + 1];
                                }
                              }
                              data['members'] = members;

                              return dispatch({
                                type: 'contests/updateContestUser',
                                payload: {
                                  id,
                                  uid: user.contestUserId,
                                  data: data,
                                },
                              });
                            }}
                            onSuccess={(
                              dispatch: ReduxProps['dispatch'],
                              ret: IApiResponse<any>,
                            ) => {
                              msg.success('Edit register info successfully');
                              tracker.event({
                                category: 'contests',
                                action: 'modifyRegisterInfo',
                              });
                            }}
                            onSuccessModalClosed={(
                              dispatch: ReduxProps['dispatch'],
                              ret: IApiResponse<any>,
                            ) => {
                              dispatch({
                                type: 'contests/getUserList',
                                payload: {
                                  cid: id,
                                  query,
                                },
                              });
                            }}
                          >
                            <a onClick={() => this.editContestUser(text.contestUserId)}>
                              <Icon type="edit" />
                            </a>
                          </GeneralFormModal>
                        </span>
                      );
                    } else {
                      return '';
                    }
                  }}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.posts.list}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>

          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'ID', fieldName: 'contestUserId' },
                  { displayName: 'Username', fieldName: 'username' },
                  { displayName: 'Nickname', fieldName: 'nickname' },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    loading: !!state.loading.effects['contests/getUserList'],
    data: state.contests.userlist,
    session: state.session,
    contestUser: state.contests.contestUserDetail,
    contestDetail: state.contests.contest[id] || {},
  };
}

export default connect(mapStateToProps)(ContestUserList);
