import { Badge } from 'antd';
import getSetTimeStatus from '@/utils/getSetTimeStatus';

export default ({ start, end, cur }) => {
  const status = getSetTimeStatus(start, end, cur);
  return (
    status === 'Pending' ?
      <Badge status="processing" text={status} className="no-wrap" />
      :
      status === 'Running' ?
        <Badge status="error" text={status} className="no-wrap" />
        :
        <Badge status="success" text={status} className="no-wrap" />
  );
};
