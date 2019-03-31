import React from 'react';
import DocumentTitle from 'react-document-title';
import { formatPageTitle } from '@/utils/format';

export interface Props {
  title: string | null;
  loading?: boolean;
}

const PageTitle: React.StatelessComponent<Props> = ({ title, loading = false, children }) => (
  <DocumentTitle title={formatPageTitle(title, loading)}>
    {children}
  </DocumentTitle>
);

export default PageTitle;
