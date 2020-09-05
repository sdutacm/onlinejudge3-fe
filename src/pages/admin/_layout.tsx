import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { isAdminDog } from '@/utils/permission';
import msg from '@/utils/msg';
import router from 'umi/router';
import pages from '@/configs/pages';

export interface Props extends RouteProps, ReduxProps {
  session: ISessionStatus;
}

interface State {}

class AdminBase extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.checkBasePermission(this.props);
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if (p.session.user?.userId !== np.session.user?.userId) {
      this.checkBasePermission(np);
    }
  }

  checkBasePermission(props: Props) {
    if (!isAdminDog(props.session)) {
      msg.error('No Permission');
      router.replace(pages.index);
    }
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
  };
}

export default connect(mapStateToProps)(AdminBase);
