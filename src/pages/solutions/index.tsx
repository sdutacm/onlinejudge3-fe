import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import ToDetailCard from '@/components/ToDetailCard';
import langs from '@/configs/solutionLanguages';
import SolutionTable from '@/components/SolutionTable';
import results, { Results } from '@/configs/results';
import pages from '@/configs/pages';

interface Props extends ReduxProps, RouteProps {
  data: List<ISolution>;
}

interface State {
}

class SolutionList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    const { loading, data, dispatch } = this.props;
    return (
      <Row gutter={16}>
        <Col xs={24} lg={18} xxl={20}>
          <Card bordered={false} className="list-card">
            <SolutionTable loading={loading} data={data} dispatch={dispatch} showPagination />
          </Card>
        </Col>
        <Col xs={24} lg={6} xxl={4}>
          <Card bordered={false}>
            <ToDetailCard label="Go to Solution" placeholder="Solution ID"
                          toDetailLink={id => urlf(pages.solutions.detail, { param: { id } })} />
          </Card>
          <Card bordered={false}>
            <FilterCard fields={[
              { displayName: 'Owner User ID', fieldName: 'userId' },
              { displayName: 'Problem ID', fieldName: 'problemId' },
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
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['solutions/getList'],
    data: state.solutions.list,
  };
}

export default connect(mapStateToProps)(SolutionList);
