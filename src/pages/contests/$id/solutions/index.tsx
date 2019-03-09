import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Spin, Form, Switch } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import SolutionTable from '@/components/SolutionTable';
import ToDetailCard from '@/components/ToDetailCard';
import { numberToAlphabet, toLongTs, urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import langs from '@/configs/solutionLanguages';
import results, { Results } from '@/configs/results';
import constants from '@/configs/constants';
import gStyles from '@/general.less';
import { isEqual } from 'lodash';
import router from 'umi/router';
import PageLoading from '@/components/PageLoading';
import PageTitle from '@/components/PageTitle';
import PageAnimation from '@/components/PageAnimation';

interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detailLoading: boolean;
  detail: IContest;
  problems: IFullList<IProblem>;
  data: IList<ISolution>;
}

interface State {
  filterOwned: boolean;
}

class ContestSolutions extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      filterOwned: ~~this.props.location.query.userId === this.props.session.user.userId,
    };
  }

  checkSolution = (query) => {
    this.props.dispatch({
      type: 'solutions/getList',
      payload: {
        ...query,
        contestId: this.props.id,
      },
    })
  };

  componentDidMount(): void {
    this.checkSolution(this.props.location.query);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    if (!isEqual(this.props.location.query, nextProps.location.query)) {
      this.checkSolution(nextProps.location.query);
      this.setState({ filterOwned: ~~nextProps.location.query.userId === nextProps.session.user.userId });
    }
  }

  handleOwnedChange = owned => {
    this.setState({ filterOwned: owned });
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
    const {
      id,
      session,
      detailLoading,
      detail,
      problems: { rows: problemRows },
      loading,
      data,
      dispatch,
      location: { query },
    } = this.props;
    if (detailLoading || detailLoading === undefined || !detail) {
      return <PageLoading />;
    }
    const problemList = (problemRows || []).map((problem, index) => ({
      problemId: problem.problemId,
      title: problem.title,
      timeLimit: problem.timeLimit,
      index,
    }));
    return (
      <PageAnimation>
        <PageTitle title="Solutions">
          <Row gutter={16}>
            <Col xs={24} lg={18} xxl={20}>
              <Card bordered={false} className="list-card">
                <SolutionTable loading={loading} data={data} dispatch={dispatch} showPagination
                               contestId={id} problemList={problemList} />
              </Card>
            </Col>
            <Col xs={24} lg={6} xxl={4}>
              <Card bordered={false}>
                <ToDetailCard label="Go to Solution" placeholder="Solution ID"
                              toDetailLink={sid => urlf(pages.contests.solutionDetail, { param: { id, sid } })} />
              </Card>
              <Card bordered={false}>
                <FilterCard fields={[
                  { displayName: 'Owner User ID', fieldName: 'userId' },
                  {
                    displayName: 'Problem', fieldName: 'problemId', options: problemList.map(problem => {
                      return {
                        fieldName: problem.problemId,
                        displayName: `${numberToAlphabet(problem.index)} - ${problem.title}`,
                      };
                    })
                  },
                  {
                    displayName: 'Language', fieldName: 'language', options: langs.map(lang => {
                      return { fieldName: lang.fieldName, displayName: lang.displayShortName };
                    })
                  },
                  {
                    displayName: 'Result', fieldName: 'result', options: results.filter(res => {
                      return res.id !== Results.WT && res.id !== Results.JG
                    }).map(res => {
                      return { fieldName: res.id, displayName: res.fullName };
                    })
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
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    id,
    session: state.contests.session[id],
    detailLoading: state.loading.effects['contests/getDetail'],
    detail: state.contests.detail[id],
    problemsLoading: state.loading.effects['contests/getProblems'],
    problems: state.contests.problems[id] || {},
    loading: !!state.loading.effects['solutions/getList'],
    data: state.solutions.list,
  };
}

export default connect(mapStateToProps)(ContestSolutions);
