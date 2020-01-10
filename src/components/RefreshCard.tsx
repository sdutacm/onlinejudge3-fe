import React from 'react';
import { withRouter } from 'react-router';
import { RouteProps } from '@/@types/props';
import { Button } from 'antd';
import router from 'umi/router';
import tracker from '@/utils/tracker';

export interface Props extends RouteProps {
  disableActionTrigger?: boolean;
}

class RefreshCard extends React.Component<Props, any> {
  static defaultProps: Partial<Props> = {
    disableActionTrigger: false,
  };

  handleRefresh = e => {
    e.preventDefault();
    if (this.props.disableActionTrigger) {
      return;
    }
    const { pathname, query } = this.props.location;
    tracker.event({
      category: 'component.RefreshCard',
      action: 'refresh',
    });
    router.replace({
      pathname,
      query: {
        ...query,
        _r: Date.now(),
      },
    });
  };

  render() {
    // return (
    //   <Button.Group style={{ width: '100%' }}>
    //     <Button block className="text-ellipsis" style={{ width: '50%' }} title="Refresh" onClick={this.handleRefresh}>
    //       Refresh
    //     </Button>
    //     <Button disabled className="text-ellipsis" style={{ width: '50%' }} title="Auto Refresh">
    //       Auto
    //     </Button>
    //   </Button.Group>
    // );
    return (
      <Button block className="text-ellipsis" title="Refresh" onClick={this.handleRefresh}>
        Refresh Data
      </Button>
    );
  }
}

export default withRouter(RefreshCard);
