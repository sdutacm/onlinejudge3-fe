import React from 'react';
import { connect } from 'dva';

interface Props {
  data: TypeObject<ISession>;
}

interface State {
}

class ContestHome extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div></div>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['contests/getSession'],
    data: state.contests.session,
  };
}

export default connect(mapStateToProps)(ContestHome);
