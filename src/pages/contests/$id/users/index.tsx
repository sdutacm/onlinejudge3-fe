/**
 * title: Posts
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card } from 'antd';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import PageAnimation from '@/components/PageAnimation';
import { isAdminDog } from '@/utils/permission'
import GeneralFormModal from '@/components/GeneralFormModal';
import msg from '@/utils/msg';
import { requestEffect } from '@/utils/effectInterceptor';
import { matchPath } from 'react-router';
import { get as safeGet } from 'lodash';

export interface Props extends ReduxProps, RouteProps {
  data: IList<IContestUser>;
  session: ISessionStatus;
  contestuser: IContestUser
}

interface State {
}

class ContestUserList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handlePageChange = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleTableChange = (e) => {
    console.log(e);
  };

  editContestUser = (uid) => {
    
    const { dispatch } = this.props;
    const matchDetail = matchPath(this.props.location.pathname, {
      path: pages.contests.users,
      exact: true,
    });
    if (matchDetail){
      
      requestEffect(dispatch, { type: 'contests/getContestUser', payload: {id: this.props.location.pathname.split('/')[2], uid: uid}});
    }
  };

  clothesSize = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  formList = ['schoolNo', 'name', 'school', 'college', 'major', 'class', 'tel', 'email', 'clothing']

  render() {
    
    const {
      loading, contestuser ,data: { page, count, rows }, 
    } = this.props;
    
    let addUserFormItems = [

      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        initialValue: contestuser.nickname,
        rules: [{ required: true, message: 'Please input nickname' }]
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        initialValue: contestuser.password,
        rules: [{ required: true, message: 'Please input password' }]
      },
      {
        name: '友情参赛',
        field: 'unofficial',
        component: 'select',
        initialValue: String(contestuser.unofficial),
        options: [{ name: '是', value: true }, { name: '否', value: false }],
      },
      {
        name: 'Name',
        field: 'name1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].name'),
        rules: [{ required: true, message: 'Please input name' }]
      },
      {
        name: 'SchoolNo',
        field: 'schoolNo1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].schoolNo'),
      },
      {
        name: 'School',
        field: 'school1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].school'),
        rules: [{ required: true, message: 'Please input school' }]
      },
      {
        name: 'College',
        field: 'college1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].college'),
      },
      {
        name: 'Major',
        field: 'major1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].major'),
      },
      {
        name: 'Class',
        field: 'class1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].class'),
        rules: [{ required: true, message: 'Please input class' }]
      },
      {
        name: 'Tel',
        field: 'tel1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].tel'),
      },
      {
        name: 'Email',
        field: 'email1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].email'),
        rules: [{ required: true, message: 'Please input email' }]
      },
      {
        name: 'Clothes',
        field: 'clothing1',
        component: 'select',
        initialValue: safeGet(contestuser, 'members[0].clothing'),
        options: this.clothesSize.map(item => ({
          value: item,
          name: item,
        })),
      }
    ]
    let addTeamUserFormItems = [

      {
        name: 'Nickname',
        field: 'nickname',
        component: 'input',
        initialValue: contestuser.nickname,
        rules: [{ required: true, message: 'Please input nickname' }]
      },
      {
        name: 'Password',
        field: 'password',
        component: 'input',
        type: 'password',
        initialValue: contestuser.password,
        rules: [{ required: true, message: 'Please input password' }]
      },
      {
        name: '友情参赛',
        field: 'unofficial',
        component: 'select',
        initialValue: String(contestuser.unofficial),
        options: [{ name: '是', value: true }, { name: '否', value: false }],
      },
      {
        name: 'Name of Member 1',
        field: 'name1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].name'),
        rules: [{ required: true, message: 'Please input name' }]
      },
      {
        name: 'SchoolNo of Member 1',
        field: 'schoolNo1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].schoolNo'),
      },
      {
        name: 'School of Member 1',
        field: 'school1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].school'),
        rules: [{ required: true, message: 'Please input school' }]
      },
      {
        name: 'College of Member 1',
        field: 'college1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].college'),
      },
      {
        name: 'Major of Member 1',
        field: 'major1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].major'),
      },
      {
        name: 'Class of Member 1',
        field: 'class1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].class'),
        rules: [{ required: true, message: 'Please input class' }]
      },
      {
        name: 'Tel of Member 1',
        field: 'tel1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].tel'),
      },
      {
        name: 'Email of Member 1',
        field: 'email1',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[0].email'),
        rules: [{ required: true, message: 'Please input email' }]
      },
      {
        name: 'Clothes of Member 1',
        field: 'clothing1',
        component: 'select',
        initialValue: safeGet(contestuser, 'members[0].clothing'),
        options: this.clothesSize.map(item => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 2',
        field: 'name2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].name'),
        rules: [{ required: true, message: 'Please input name' }]
      },
      {
        name: 'SchoolNo of Member 2',
        field: 'schoolNo2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].schoolNo'),
      },
      {
        name: 'School of Member 2',
        field: 'school2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].school'),
        rules: [{ required: true, message: 'Please input school' }]
      },
      {
        name: 'College of Member 2',
        field: 'college2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].college'),
      },
      {
        name: 'Major of Member 2',
        field: 'major2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].major'),
      },
      {
        name: 'Class of Member 2',
        field: 'class2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].class'),
        rules: [{ required: true, message: 'Please input class' }]
      },
      {
        name: 'Tel of Member 2',
        field: 'tel2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].tel'),
      },
      {
        name: 'Email of Member 2',
        field: 'email2',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[1].email'),
      },
      {
        name: 'Clothes of Member 2',
        field: 'clothing2',
        component: 'select',
        initialValue: safeGet(contestuser, 'members[1].clothing'),
        options: this.clothesSize.map(item => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Name of Member 3',
        field: 'name3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].name'),
        rules: [{ required: true, message: 'Please input name' }]
      },
      {
        name: 'SchoolNo of Member 3',
        field: 'schoolNo3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].schoolNo'),
      },
      {
        name: 'School of Member 3',
        field: 'school3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].school'),
        rules: [{ required: true, message: 'Please input school' }]
      },
      {
        name: 'College  of Member 3',
        field: 'college3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].college'),
      },
      {
        name: 'Major  of Member 3',
        field: 'major3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].major'),
      },
      {
        name: 'Class of Member 3',
        field: 'class3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].class'),
        rules: [{ required: true, message: 'Please input class' }]
      },
      {
        name: 'Tel of Member 3',
        field: 'tel3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].tel'),
      },
      {
        name: 'Email of Member 3',
        field: 'email3',
        component: 'input',
        initialValue: safeGet(contestuser, 'members[2].email'),
      },
      {
        name: 'Clothes  of Member 3',
        field: 'clothing3',
        component: 'select',
        initialValue: safeGet(contestuser, 'members[2].clothing'),
        options: this.clothesSize.map(item => ({
          value: item,
          name: item,
        })),
      }
    ]
    let this_ = this;
    return (
      <PageAnimation>
        <Row gutter={16}>
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="postId"
                loading={loading}
                onChange={this.handleTableChange}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title=""
                  key="unofficial"
                  render={(text, user: IContestUser) => {
                    if (user.unofficial){
                      return '*'
                    }
                    else{
                      return ''
                    }
                  }}
                />
                <Table.Column
                  title="ID"
                  key="contestUserId"
                  dataIndex="contestUserId"
                />
                <Table.Column
                  title="Username"
                  key="username"
                  dataIndex="username"
                />
                <Table.Column
                  title="Nickname"
                  key="nickname"
                  dataIndex="nickname"
                />
                <Table.Column
                  title="Info"
                  key="info"
                  render={(text, user: IContestUser) => {
                    return user.members.map((item) => {
                      let str = [item.name, item.school, item.class].filter(item => item).join(' | ')
                    return <span>{str}<br></br></span>
                    })
                  }}
                />
                
                <Table.Column
                  title="Status"
                  key="status"
                  render={(text, user: IContestUser)=>{
                    if(user.status === 0){
                      return <span style={{color: 'blue'}}>等待确认</span>
                    }
                    if(user.status === 1){
                      return <span style={{color: 'green'}}>接受</span>
                    }
                    if(user.status === 2){
                      return <span style={{color: 'yellow'}}>等待修改</span>
                    }
                    if(user.status === 3){
                      return <span style={{color: 'red'}}>已拒绝</span>
                    }
                  }}
                />
                <Table.Column
                  title="Edit"
                  key="edit"
                  render={(text, user: IContestUser) => {
                    if ((this.props.session.loggedIn && user.username === this.props.session.user.username) || isAdminDog(this.props.session)){
                      return <span><GeneralFormModal
                      loadingEffect="contests/addContestUser"
                      title="Join Contest"
                      autoMsg
                      items={text.members.length === 3 ? addTeamUserFormItems : addUserFormItems}
                      submit={(dispatch: ReduxProps['dispatch'], values) => {
                        let data = {};
                        data['nickname'] = values['nickname'];
                        data['password'] = values['password'];
                        data['unofficial'] = values['unofficial'] === "false" ? false : true;
                        let members = [];
                        if (text.members.length === 3 ) {
                          members = [{}, {}, {}];
                          for (let i = 0; i < 3; i++) {
                            for (let j = 0; j < this.formList.length; j++) {
                              members[i][this.formList[j]] = values[this.formList[j] + (i + 1)]
                            }
                          }
                        }
                        else {
                          members = [{}];
                          for (let j = 0; j < this.formList.length; j++) {
                            members[0][this.formList[j]] = values[this.formList[j] + 1]
                          }
                        }
                        data['members'] = members;

                        return dispatch({
                          type: 'contests/updateContestUser',
                          payload: {
                            id: this_.props.location.pathname.split('/')[2],
                            uid: user.contestUserId,
                            data: data,
                          },
                        });
                      }}
                      onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                        msg.success('Join Contest successfully');
                      }}
                      onSuccessModalClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                      }}
                    >

                      <span style={{ color: '#33ccff' }} onClick={() => this.editContestUser(text.contestUserId)}>Edit</span>
                    </GeneralFormModal></span>
                    }
                    else{
                      return ''
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
  return {
    loading: !!state.loading.effects['contests/getUserList'],
    data: state.contests.userlist,
    session: state.session,
    contestuser: state.contests.contestuser
  };
}

export default connect(mapStateToProps)(ContestUserList);
