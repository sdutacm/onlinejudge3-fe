/**
 * title: Admin
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
}

interface State {}

class AdminIndex extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <PageAnimation>
        <div>
          <h1>Admin Area</h1>
          <p>Select function from navigator bar.</p>
        </div>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
  };
}

export default connect(mapStateToProps)(AdminIndex);
