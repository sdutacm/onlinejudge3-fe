import React from 'react';
import { Spin } from 'antd';
import constants from '@/configs/constants';

interface Props {
}

const PageLoading: React.StatelessComponent<Props> = ({}) => (
  <div className="center-view">
    <Spin delay={constants.indicatorDisplayDelay} />
  </div>
);

export default PageLoading;
