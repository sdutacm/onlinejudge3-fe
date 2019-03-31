import React from 'react';
import { connect } from 'dva';
import classNames from 'classnames';

export interface Props {
  improveAnimation: boolean;
}

class PageAnimation extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { children, improveAnimation } = this.props;
    return (
      <div className={classNames('duration-400 fadeInUpPage', { animated: improveAnimation })}>{children}</div>
    );
  }
}

function mapStateToProps(state) {
  return {
    improveAnimation: state.settings.improveAnimation,
  };
}

export default connect(mapStateToProps)(PageAnimation);
