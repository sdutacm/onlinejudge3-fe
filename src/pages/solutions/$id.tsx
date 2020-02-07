import React from 'react';
import { ReduxProps, RouteProps } from '@/@types/props';
import { connect } from 'dva';
import SolutionDetailPage from '@/components/SolutionDetailPage';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
  data: ITypeObject<ISolution>;
  changeSharedLoading: boolean;
}

interface State {
}

class SolutionDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if (p.session !== np.session) {
      const id = ~~np.match.params.id;
      if (id) {
        np.dispatch({
          type: 'solutions/getDetail',
          payload: {
            id,
            force: true,
          },
        });
      }
    }
  }

  onShareChange = (checked) => {
    // console.log(checked);
  };

  render() {
    const { loading, data: allData, changeSharedLoading, session, match, dispatch } = this.props;
    const id = ~~match.params.id;
    const data = allData[id] || {} as ISolution;
    return <SolutionDetailPage
      loading={loading}
      data={data}
      changeSharedLoading={changeSharedLoading}
      session={session}
      dispatch={dispatch}
    />;
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['solutions/getDetail'],
    data: state.solutions.detail,
    changeSharedLoading: !!state.loading.effects['solutions/changeShared'],
    session: state.session,
  };
}

export default connect(mapStateToProps)(SolutionDetail);
