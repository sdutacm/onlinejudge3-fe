import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card } from 'antd';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import ToOneCard from '@/components/ToOneCard';
import api from '@/configs/apis';
import langs from '@/configs/solutionLanguages';
import SolutionTable from '@/components/SolutionTable';
import results from '@/configs/results';

interface Props extends ReduxProps, RouteProps {
  data: List<Solution>;
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
            <ToOneCard label="Go to Solution" placeholder="Solution ID"
                       toOneLink={id => urlf(api.solutions.one, { param: { id } })} />
          </Card>
          <Card bordered={false}>
            <FilterCard fields={[
              { displayName: 'Owner', fieldName: 'nickname' },
              { displayName: 'Problem ID', fieldName: 'problemId' },
              {
                displayName: 'Language', fieldName: 'language', options: langs.map(lang => {
                  return { fieldName: lang.fieldName, displayName: lang.displayShortName };
                })
              },
              {
                displayName: 'Result', fieldName: 'result', options: results.map(res => {
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
