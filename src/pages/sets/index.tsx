/**
 * title: Sets
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
import ToDetailCard from '@/components/ToDetailCard';

interface Props extends ReduxProps, RouteProps {
  data: IList<ISet>;
}

class SetList extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  handlePageChange = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  render() {
    const { loading, data: { page, count, rows } } = this.props;
    return (
      <Row gutter={16}>
        <Col xs={24} md={18} xxl={20}>
          <Card bordered={false} className="list-card">
            <Table dataSource={rows}
                   rowKey="setId"
                   loading={loading}
                   pagination={false}
                   className="responsive-table"
            >
              <Table.Column
                title="Title"
                key="Title"
                render={(text, record: ISet) => (
                  <div>
                    <Link to={urlf(pages.sets.detail, { param: { id: record.setId } })}>{record.title}</Link>
                  </div>
                )}
              />
            </Table>
            <Pagination
              className="ant-table-pagination"
              total={count}
              current={page}
              pageSize={limits.sets.list}
              onChange={this.handlePageChange}
            />
          </Card>
        </Col>
        <Col xs={24} md={6} xxl={4}>
          <Card bordered={false}>
            <ToDetailCard label="Go to Set" placeholder="Set ID"
                          toDetailLink={id => urlf(pages.sets.detail, { param: { id } })} />
          </Card>
          <Card bordered={false}>
            <FilterCard fields={[
              { displayName: 'Title', fieldName: 'title' },
            ]} />
          </Card>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['sets/getList'],
    data: state.sets.list,
  };
}

export default connect(mapStateToProps)(SetList);
