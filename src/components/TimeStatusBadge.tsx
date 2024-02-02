import { Badge } from 'antd';
import getSetTimeStatus from '@/utils/getSetTimeStatus';

export default ({ start, end, cur, lang = 'en' }) => {
  const status = getSetTimeStatus(start, end, cur);
  return status === 'Pending' ? (
    <Badge status="processing" text={lang === 'zh-cn' ? '未开始' : status} className="no-wrap" />
  ) : status === 'Running' ? (
    <Badge status="error" text={lang === 'zh-cn' ? '进行中' : status} className="no-wrap" />
  ) : (
    <Badge status="success" text={lang === 'zh-cn' ? '已结束' : status} className="no-wrap" />
  );
};
