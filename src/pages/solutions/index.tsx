/**
 * title: Solutions
 */

import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Switch } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import ToDetailCard from '@/components/ToDetailCard';
import langs from '@/configs/solutionLanguages';
import SolutionTable from '@/components/SolutionTable';
import results, { Results } from '@/configs/results';
import pages from '@/configs/pages';
import gStyles from '@/general.less';
import { isEqual } from 'lodash';
import router from 'umi/router';
import constants from '@/configs/constants';
import PageAnimation from '@/components/PageAnimation';
import tracker from '@/utils/tracker';

export interface Props extends ReduxProps, RouteProps {
  data: IList<ISolution>;
  session: ISessionStatus;
}

interface State {
  filterOwned: boolean;
}

class SolutionList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      filterOwned: ~~this.props.location.query.userId === this.props.session.user.userId,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!isEqual(this.props.location.query, nextProps.location.query)) {
      this.setState({ filterOwned: ~~nextProps.location.query.userId === nextProps.session.user.userId });
    }
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  handleOwnedChange = owned => {
    this.setState({ filterOwned: owned });
    tracker.event({
      category: 'solutions',
      action: 'switchOwn',
    });
    setTimeout(() => router.replace({
      pathname: this.props.location.pathname,
      query: {
        ...this.props.location.query,
        userId: owned ? this.props.session.user.userId : undefined,
        page: 1,
      },
    }), constants.switchAnimationDuration);
  };

  render() {
    const { loading, data, dispatch, session } = this.props;
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} lg={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <SolutionTable
                loading={loading}
                data={data}
                dispatch={dispatch}
                showPagination
                session={session}
              />
            </Card>
          </Col>
          <Col xs={24} lg={6} xxl={4}>
            <Card bordered={false}>
              <ToDetailCard
                label="Go to Solution"
                placeholder="Solution ID"
                toDetailLink={id => urlf(pages.solutions.detail, { param: { id } })}
              />
            </Card>
            <Card bordered={false}>
              <FilterCard fields={[
                { displayName: 'Owner User ID', fieldName: 'userId' },
                { displayName: 'Problem ID', fieldName: 'problemId' },
                {
                  displayName: 'Language', fieldName: 'language', options: langs.map(lang => {
                    return { fieldName: lang.fieldName, displayName: lang.displayShortName };
                  }),
                },
                {
                  displayName: 'Result', fieldName: 'result', options: results.filter(res => {
                    return res.id !== Results.WT && res.id !== Results.JG;
                  }).map(res => {
                    return { fieldName: res.id, displayName: res.fullName };
                  }),
                },
              ]} />
            </Card>
            {session.loggedIn &&
            <Card bordered={false}>
              <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
                <Form.Item className="single-form-item" label={
                  <div>
                    <span className="title">My Solutions</span>
                    <div className="float-right">
                      <Switch checked={this.state.filterOwned} onChange={this.handleOwnedChange} loading={loading} />
                    </div>
                  </div>
                } />
              </Form>
            </Card>}
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['solutions/getList'],
    data: state.solutions.list,
    session: state.session,
  };
}

export default connect(mapStateToProps)(SolutionList);
