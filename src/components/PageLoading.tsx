import React from 'react';
import { Spin } from 'antd';
import constants from '@/configs/constants';
import PageTitle from '@/components/PageTitle';

export interface Props {
  delay?: boolean;
}

const PageLoading: React.FC<Props> = ({ delay = false }) => (
  <PageTitle title={null} loading={true}>
    <div className="center-view">
      <Spin delay={delay ? constants.indicatorDisplayDelay : undefined} />
    </div>
  </PageTitle>
);

export default PageLoading;
