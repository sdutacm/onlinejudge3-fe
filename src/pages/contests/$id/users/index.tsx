/**
 * title: Contest Users
 */

import React from 'react';
import { connect } from 'dva';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { getPathParamId } from '@/utils/getPathParams';
import ContestUserList from '@/components/ContestUserList';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  data: IList<IContestUser>;
  contestUser: IContestUser;
  contestDetail: IContest;
}

interface State {}

class ContestUserListPage extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      loading,
      data,
      id,
      contestUser,
      contestDetail,
    } = this.props;
    return (
      <PageAnimation>
        <h4 className="mb-md-lg">
          Participants of {id} - {contestDetail?.title || '-'}
        </h4>
        <ContestUserList
          id={id}
          data={data}
          contestUser={contestUser}
          contestDetail={contestDetail}
          loading={loading}
        />
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
    contestUser: state.contests.contestUserDetail,
    contestDetail: state.contests.contest[id] || {},
  };
}

export default connect(mapStateToProps)(ContestUserListPage);
