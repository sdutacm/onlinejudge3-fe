/**
 * title: Competitions
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Icon, Tag } from 'antd';
import router from 'umi/router';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import ToDetailCard from '@/components/ToDetailCard';
import { Link } from 'react-router-dom';
import TimeStatusBadge from '@/components/TimeStatusBadge';
import moment from 'moment';
import PageAnimation from '@/components/PageAnimation';
import { ICompetition } from '@/common/interfaces/competition';

export interface Props extends ReduxProps, RouteProps {
  data: IList<ICompetition>;
  proMode: boolean;
}

interface State {}

class CompetitionList extends React.Component<Props, State> {
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

  // canRegister = (registerStartAt: Date, registerEndAt: Date) => {
  //   const serverTime = Date.now() - ((window as any)._t_diff || 0);
  //   return (
  //     this.props.session.loggedIn &&
  //     registerStartAt.getTime() <= serverTime &&
  //     serverTime < registerEndAt.getTime()
  //   );
  // };

  render() {
    const {
      loading,
      data: { page, count, rows },
      location: { query },
      proMode,
    } = this.props;
    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="competitionId"
                loading={loading}
                pagination={false}
                className="responsive-table no-header-table listlike-table"
              >
                <Table.Column
                  title=""
                  key="Type"
                  className="text-right td-icon"
                  render={(text, record: ICompetition) => (
                    <span>{record.isTeam && <Icon type="team" />}</span>
                  )}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  render={(text, record: ICompetition) => (
                    <div className="listlike-table-info">
                      <div className="listlike-table-info-primary">
                        <Link
                          className="listlike-table-info-title"
                          to={urlf(pages.competitions.home, {
                            param: { id: record.competitionId },
                          })}
                        >
                          {proMode ? `${record.competitionId} - ` : ''}
                          {record.title}
                          {record.rule === 'ICPC' && <Tag color="blue" className="cursor-default ml-md mr-none">ICPC</Tag>}
                          {record.rule === 'ICPCWithScore' && <Tag color="blue" className="cursor-default ml-md mr-none">ICPC + Score</Tag>}
                          {record.isRating && <Tag color="purple" className="cursor-default ml-md mr-none">Rating</Tag>}
                        </Link>
                      </div>
                      <div className="listlike-table-info-secondary">
                        <span>
                          {moment(record.startAt).format('YYYY-MM-DD HH:mm:ss')} ~{' '}
                          {moment(record.endAt).format('YYYY-MM-DD HH:mm:ss')}
                        </span>
                      </div>
                    </div>
                  )}
                />
                <Table.Column
                  title="Status"
                  key="status"
                  className="no-wrap"
                  render={(text, record: any) => (
                    <TimeStatusBadge
                      start={new Date(record.startAt).getTime()}
                      end={new Date(record.endAt).getTime()}
                      cur={serverTime}
                    />
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.competitions.list}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <ToDetailCard
                label="Go to Competition"
                placeholder="Competition ID"
                toDetailLink={(id) => urlf(pages.competitions.home, { param: { id } })}
              />
            </Card>
            <Card bordered={false}>
              <FilterCard fields={[{ displayName: 'Title', fieldName: 'title' }]} initQuery={{}} />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['competitions/getList'],
    data: state.competitions.list,
    proMode: !!state.settings.proMode,
  };
}

export default connect(mapStateToProps)(CompetitionList);
