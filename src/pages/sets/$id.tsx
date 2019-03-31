import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Table } from 'antd';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import NotFound from '@/pages/404';
import PageTitle from '@/components/PageTitle';
import PageLoading from '@/components/PageLoading';
import { filterXSS as xss } from 'xss';
import { Link } from 'react-router-dom';
import { numberToAlphabet, urlf } from '@/utils/format';
import classNames from 'classnames';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends ReduxProps, RouteProps {
  data: ITypeObject<ISet>;
  session: ISessionStatus;
  problemResultStats: IUserProblemResultStats;
}

interface State {
}

class SetDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentDidMount(): void {
  //   window.scrollTo(0, 0);
  // }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    // 当用户态显现
    if (!this.props.session.loggedIn && nextProps.session.loggedIn) {
      nextProps.dispatch({
        type: 'sets/getDetail',
        payload: {
          id: getPathParamId(nextProps.location.pathname, pages.sets.detail),
          force: true,
        },
      });
    }
  }

  render() {
    const {
      loading, data: allData, session, match, problemResultStats: { acceptedProblemIds, attemptedProblemIds },
    } = this.props;
    const id = ~~match.params.id;
    const data = allData[id] || {} as ISet;
    if (loading) {
      return <PageLoading />;
    }
    if (!loading && !data.setId) {
      return <NotFound />;
    }
    switch (data.type) {
      case 'standard':
        const props: ISetPropsTypeStandard = data.props;
        return (
          <PageAnimation>
            <PageTitle title={data.title}>
              <Row gutter={16} className="content-view">
                <Col xs={24}>
                  <Card bordered={false}>
                    <h2 className="text-center">{data.title}</h2>
                    <div
                      dangerouslySetInnerHTML={{ __html: xss(data.description) }}
                      className="content-area"
                      style={{ marginTop: '15px' }}
                    />
                  </Card>

                  <Card bordered={false} className="list-card">
                    {props.sections.map((section, sectionIndex) =>
                      <div key={sectionIndex}>
                        <Table
                          dataSource={section.problems}
                          rowKey={(record: IProblem) => `${record.problemId}`}
                          loading={loading}
                          pagination={false}
                          className="responsive-table"
                          rowClassName={(record: IProblem) => classNames(
                            'problem-result-mark-row',
                            { 'accepted': ~acceptedProblemIds.indexOf(record.problemId) },
                            { 'attempted': ~attemptedProblemIds.indexOf(record.problemId) }
                          )}
                        >
                          <Table.Column
                            title={section.title}
                            key="Title"
                            render={(text, record: IProblem, problemIndex) => (
                              <span>
                                <span style={{ minWidth: '32px', display: 'inline-block' }}>
                                  {`${sectionIndex + 1}${numberToAlphabet(problemIndex)}`}
                                </span>
                                {record.problemId && record.title ?
                                  <Link to={urlf(pages.problems.detail, {
                                    param: { id: record.problemId },
                                    query: { from: `/sets/${data.setId}` },
                                  })}>{record.title}</Link> :
                                  <span>Unknown Problem</span>
                                }
                              </span>
                            )}
                          />
                        </Table>
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </PageTitle>
          </PageAnimation>
        );
      default:
        return <PageTitle title={data.title} />;
    }
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['sets/getDetail'],
    data: state.sets.detail,
    session: state.session,
    problemResultStats: state.users.problemResultStats,
  };
}

export default connect(mapStateToProps)(SetDetail);
