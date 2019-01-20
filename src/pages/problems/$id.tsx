import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import ProblemDetailPage from '@/components/ProblemDetailPage';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';

interface Props extends ReduxProps, RouteProps {
  data: ITypeObject<IProblem>;
  session: ISessionStatus;
  favorites: IFullList<IFavorite>;
}

interface State {
}

class ProblemDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    window.scrollTo(0, 0);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    // 当用户态显现
    if (!this.props.session.loggedIn && nextProps.session.loggedIn) {
      nextProps.dispatch({
        type: 'problems/getDetail',
        payload: {
          id: getPathParamId(nextProps.location.pathname, pages.problems.detail),
          force: true,
        },
      })
    }
  }

  render() {
    const { loading, data: allData, session, match, favorites } = this.props;
    const id = ~~match.params.id;
    const data = allData[id] || {} as IProblem;
    return <ProblemDetailPage loading={loading} data={data} session={session} favorites={favorites.rows} />;
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['problems/getDetail'],
    data: state.problems.detail,
    session: state.session,
    favorites: state.favorites.list,
  };
}

export default connect(mapStateToProps)(ProblemDetail);
