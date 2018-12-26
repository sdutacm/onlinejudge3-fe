import React from 'react';
import { ReduxProps, RouteProps } from '@/@types/props';
import { connect } from 'dva';
import SolutionDetailPage from '@/components/SolutionDetailPage';

interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  data: TypeObject<ISolution>;
}

interface State {
}

class SolutionDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onShareChange = (checked) => {
    console.log(checked);
  };

  render() {
    const { loading, data: allData, session, match, dispatch } = this.props;
    const id = ~~match.params.id;
    const data = allData[id] || {} as ISolution;
    return <SolutionDetailPage loading={loading} data={data} session={session} dispatch={dispatch} />;
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['solutions/getDetail'],
    data: state.solutions.detail,
    session: state.session,
  };
}

export default connect(mapStateToProps)(SolutionDetail);
