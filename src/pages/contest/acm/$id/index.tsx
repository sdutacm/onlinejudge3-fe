import React from 'react';
import router from 'umi/router';
import pages from '@/configs/pages';
import { RouteProps } from '@/@types/props';

interface Props extends RouteProps {
}

class ContestIndex extends React.Component<Props, any> {
  componentDidMount() {
    router.replace({
      pathname: `${pages.contest.index}/${this.props.match.params.id}/home`,
    });
  }

  render() {
    return (
      <div />
    );
  }
}

export default ContestIndex;
