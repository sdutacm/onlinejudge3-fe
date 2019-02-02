import React from 'react';
import { Spin } from 'antd';
import constants from '@/configs/constants';
import PageTitle from '@/components/PageTitle';

interface Props {
}

const PageLoading: React.StatelessComponent<Props> = ({}) => (
  <PageTitle title={null} loading={true}>
    <div className="center-view">
      <Spin delay={constants.indicatorDisplayDelay} />
    </div>
  </PageTitle>
);

export default PageLoading;
