import React from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import { formatAvatarUrl, urlf } from '@/utils/format';

interface Props {
  user: IUser | IUserLite;
  isContestUser?: boolean;
}

const UserBar: React.StatelessComponent<Props> = ({ user, isContestUser }) => {
  const inner = <span>
    <Avatar size="small" icon="user" src={formatAvatarUrl(user.avatar)} /><span style={{ marginLeft: '8px' }}>{user.nickname}</span>
  </span>;
  if (isContestUser) {
    return inner;
  }
  return (
    <Link to={urlf(pages.users.detail, { param: { id: user.userId } })}
          onClick={e => e.stopPropagation()}>
      {inner}
    </Link>
  );
};

export default UserBar;
