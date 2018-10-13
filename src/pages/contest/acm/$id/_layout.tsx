import React from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import secToTimeStr from '@/utils/secToTimeStr';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';

interface Props extends ReduxProps, RouteProps {
  detail: object;
  serverTime: string;
}

interface State {
  authorized: boolean;
  lastVisitedProblem: number | null;
  timeRemaining: number;
  timeRemainingTimer: number;
}

class ContestLayout extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      authorized: false,
      lastVisitedProblem: this.getLastVisitedProblem(props.location.pathname) || 1,
      timeRemaining: null,
      timeRemainingTimer: null,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname && nextProps.location.pathname.endsWith('/problem')) {
      let lastVisitedProblem = this.getLastVisitedProblem(nextProps.location.query);
      if (lastVisitedProblem) {
        this.setState({ lastVisitedProblem: Number(lastVisitedProblem) });
      }
    }
  }

  componentDidMount() {
    const { dispatch, match } = this.props;
    const id = match.params.id;
    dispatch({
      type: 'contest_acm/getDetail',
      payload: { id },
    }).then(() => {
      const { detail, serverTime } = this.props;
      this.setState({ authorized: true });
      const data = detail[id];
      const status = getSetTimeStatus(data.started_at, data.ended_at, serverTime);
      if (status !== 'Ended') {
        this.setState({ timeRemaining: moment(data.ended_at).diff(serverTime, 'seconds') });
        const timer: any = setInterval(function () {
          this.setState(prevState => {
            if (prevState.timeRemaining < 1) {
              clearInterval(prevState.timeRemainingTimer);
              dispatch({
                type: 'contest_acm/getDetail',
                payload: { id },
              });
              return { timeRemaining: null };
            }
            return { timeRemaining: prevState.timeRemaining - 1 };
          });
        }.bind(this), 1000);
        this.setState({ timeRemainingTimer: timer });
      }
    }).catch(err => {
      if (err.response.status === 403) {
        if (this.props.history.length > 2) {
          router.goBack();
        }
        else {
          router.push({
            pathname: pages.contest.index,
          });
        }
      }
    });
  }

  getLastVisitedProblem = query => {
    if (query.index) {
      return parseInt(query.index, 10);
    }
    return null;
  };

  handleChangeTab = key => {
    const id = this.props.match.params.id;
    if (key === '/problem') {
      router.push({
        pathname: `${pages.contest.index}/${id}${key}`,
        query: { index: this.state.lastVisitedProblem },
      });
    }
    else {
      router.push({
        pathname: `${pages.contest.index}/${id}${key}`,
      });
    }
  };

  render() {
    const { children, location } = this.props;
    // const id = match.params.id;
    let re = new RegExp(`^/contest/acm/\\d+(/\\w+)`);
    let matched = location.pathname.match(re);
    let matchedPath = matched ? location.pathname.match(re)[1] : '';
    if (this.state.authorized) {
      // const data = detail[id];
      let timeStr;
      if (this.state.timeRemaining) {
        timeStr = secToTimeStr(this.state.timeRemaining);
      }

      return (
        <div>
          <Tabs onChange={this.handleChangeTab} type="card" activeKey={matchedPath}>
            <Tabs.TabPane tab="Home" key="/home" />
            <Tabs.TabPane tab="Problem" key="/problem" />
            <Tabs.TabPane tab="Status" key="/status" />
            <Tabs.TabPane tab="Ranklist" key="/ranklist" />
            {
              this.state.timeRemaining ?
                <Tabs.TabPane tab={timeStr} key="timer" disabled />
                : ''
            }
          </Tabs>
          {children}
        </div>
      );
    }
    return <div />;
  }
}

function mapStateToProps(state) {
  const detail = state.contest_acm.detail;
  const serverTime = state.contest_acm.serverTime;
  return {
    loading: !!state.loading.effects['contest_acm/getDetail'],
    detail,
    serverTime,
  };
}

export default connect(mapStateToProps)(ContestLayout);
