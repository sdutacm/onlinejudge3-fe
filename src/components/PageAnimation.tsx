import React from 'react';
import { connect } from 'dva';
import classNames from 'classnames';
import {
  markInitialPageAnimationMounted,
  shouldSkipInitialPageAnimation,
} from '@/utils/pageAnimationHydration';

export interface Props {
  improveAnimation: boolean;
}

class PageAnimation extends React.Component<Props> {
  private skipInitialAnimation: boolean;

  constructor(props) {
    super(props);
    this.skipInitialAnimation = shouldSkipInitialPageAnimation();
  }

  componentDidMount() {
    if (this.skipInitialAnimation) {
      markInitialPageAnimationMounted();
    }
  }

  render() {
    const { children, improveAnimation } = this.props;
    return (
      <div
        className={classNames('duration-400 fadeInUpPage', {
          animated: improveAnimation && !this.skipInitialAnimation,
        })}
      >
        {children}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    improveAnimation: state.settings.improveAnimation,
  };
}

export default connect(mapStateToProps)(PageAnimation);
