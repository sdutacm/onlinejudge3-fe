import React from 'react';
import constants from '@/configs/constants';
import PageTitle from '@/components/PageTitle';

export interface Props {
  delay?: boolean;
}

const PageLoading: React.FC<Props> = ({ delay = false }) => (
  <PageTitle title={null} loading={true}>
    <div>
      <div className="route-loading-bar" />
      <div className="center-view">
        <div
          className="route-loading-spinner"
          style={{ animationDelay: delay ? `${constants.indicatorDisplayDelay}ms` : undefined }}
        />
      </div>
    </div>
  </PageTitle>
);

export default PageLoading;
