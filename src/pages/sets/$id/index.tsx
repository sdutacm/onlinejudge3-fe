import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Table, Icon, Progress, Modal } from 'antd';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import NotFound from '@/pages/404';
import PageTitle from '@/components/PageTitle';
import PageLoading from '@/components/PageLoading';
import { filterXSS as xss } from 'xss';
import { Link } from 'react-router-dom';
import { urlf } from '@/utils/format';
import classNames from 'classnames';
import PageAnimation from '@/components/PageAnimation';
import { isSelf, isAdminDog } from '@/utils/permission';
import ImportSetModal from '@/components/ImportSetModal';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import router from 'umi/router';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  detail: ISet;
  session: ISessionStatus;
  problemResultStats: IUserProblemResultStats;
  deleteLoading: boolean;
}

interface State {}

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

  deleteSet = () => {
    Modal.confirm({
      className: 'ant-modal-confirm-content-only',
      content: 'Delete Set? You can not redo this operation.',
      onOk: () => {
        if (this.props.deleteLoading) {
          return;
        }
        return this.props
          .dispatch({
            type: 'sets/deleteSet',
            payload: {
              id: this.props.id,
            },
          })
          .then((ret: IApiResponse) => {
            msg.auto(ret);
            if (ret.success) {
              tracker.event({
                category: 'sets',
                action: 'deleteSet',
              });
              msg.success('Deleted set');
              this.props.dispatch({
                type: 'sets/clearList',
                payload: {},
              });
              this.props.dispatch({
                type: 'sets/clearDetail',
                payload: {
                  id: this.props.id,
                },
              });
              router.replace({
                pathname: pages.sets.index,
              });
            }
          });
      },
    });
  };

  render() {
    const {
      id,
      detail,
      loading,
      session,
      problemResultStats: { acceptedProblemIds, attemptedProblemIds },
    } = this.props;
    if (loading) {
      return <PageLoading />;
    }
    if (!loading && !detail.setId) {
      return <NotFound />;
    }
    switch (detail.type) {
      case 'standard':
        const props: ISetPropsTypeStandard = detail.props;
        const sectionAcceptedCount = props.sections.map((section) =>
          section.problems.reduce(
            (acc, cur) => acc + (~acceptedProblemIds.indexOf(cur.problemId) ? 1 : 0),
            0,
          ),
        );

        return (
          <PageAnimation>
            <PageTitle title={detail.title}>
              <Row gutter={16} className="content-view">
                <Col xs={24}>
                  <Card bordered={false}>
                    <h2 className="text-center">{detail.title}</h2>
                    <div
                      dangerouslySetInnerHTML={{ __html: xss(detail.description) }}
                      className="content-area"
                      style={{ marginTop: '15px' }}
                    />
                    <div className="flex-justify-space-between mt-md">
                      <div />
                      <div className="pointer">
                        {isSelf(session, detail.user.userId) || isAdminDog(session) ? (
                          <ImportSetModal type="update" setId={id}>
                            <a className="ml-lg normal-text-link">
                              <Icon type="edit" /> Update
                            </a>
                          </ImportSetModal>
                        ) : null}
                        {isSelf(session, detail.user.userId) || isAdminDog(session) ? (
                          <a
                            className="ml-lg normal-text-link text-danger"
                            onClick={this.deleteSet}
                          >
                            <Icon type="delete" /> Delete
                          </a>
                        ) : null}
                        {session.loggedIn && (
                          <Link
                            to={urlf(pages.sets.stats, { param: { id } })}
                            className="ml-lg normal-text-link"
                            onClick={() => {
                              tracker.event({
                                category: 'sets',
                                action: 'toStats',
                              });
                            }}
                          >
                            <Icon type="table" /> Statistics
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card bordered={false} className="list-card">
                    {props.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        <Table
                          dataSource={section.problems}
                          rowKey={(record: IProblem) => `${record.problemId}`}
                          loading={loading}
                          pagination={false}
                          className="responsive-table"
                          rowClassName={(record: IProblem) =>
                            classNames(
                              'problem-result-mark-row',
                              { accepted: ~acceptedProblemIds.indexOf(record.problemId) },
                              { attempted: ~attemptedProblemIds.indexOf(record.problemId) },
                            )
                          }
                        >
                          <Table.Column
                            title={
                              <div className="flex-justify-space-between">
                                <span>{section.title}</span>
                                {session.loggedIn && (
                                  <div style={{ width: '90px' }}>
                                    <Progress
                                      percent={Math.floor(
                                        (sectionAcceptedCount[sectionIndex] /
                                          section.problems.length) *
                                          100,
                                      )}
                                      size="small"
                                    />
                                  </div>
                                )}
                              </div>
                            }
                            key="Title"
                            render={(text, record: IProblem, problemIndex) => (
                              <span>
                                <span style={{ minWidth: '54px', display: 'inline-block' }}>
                                  {`${sectionIndex + 1}-${problemIndex + 1}`}
                                </span>
                                {record.problemId && record.title ? (
                                  <Link
                                    to={urlf(pages.problems.detail, {
                                      param: { id: record.problemId },
                                      query: { from: `/sets/${detail.setId}` },
                                    })}
                                  >
                                    {record.title}
                                  </Link>
                                ) : (
                                  <span>Unknown Problem</span>
                                )}
                              </span>
                            )}
                          />
                        </Table>
                      </div>
                    ))}
                  </Card>
                </Col>
              </Row>
            </PageTitle>
          </PageAnimation>
        );
      default:
        return <PageTitle title={detail.title} />;
    }
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.sets.detail);
  return {
    id,
    loading: !!state.loading.effects['sets/getDetail'],
    detail: state.sets.detail[id] || {},
    session: state.session,
    problemResultStats: state.users.problemResultStats,
    deleteLoading: !!state.loading.effects['sets/deleteSet'],
  };
}

export default connect(mapStateToProps)(SetDetail);
