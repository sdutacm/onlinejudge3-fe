import React from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import { formatAvatarUrl, urlf } from '@/utils/format';
import classNames from 'classnames';

export interface Props {
  user: IUser | IUserLite;
  isContestUser?: boolean;
  hideAvatar?: boolean;
  className?: string;
}

const UserBar: React.FC<Props> = ({ user, isContestUser = false, hideAvatar = false, className }) => {
  const inner = !hideAvatar ? <span className={classNames('no-wrap', className)}>
    <Avatar size="small" icon="user" src={formatAvatarUrl(user.avatar)} /><span style={{ marginLeft: '8px' }}>{user.nickname}</span>
  </span> : <span className={classNames('no-wrap', className)}>{user.nickname}</span>;
  if (isContestUser) {
    return inner;
  }
  return (
    <Link
      to={urlf(pages.users.detail, { param: { id: user.userId } })}
      onClick={e => e.stopPropagation()}>
      {inner}
    </Link>
  );
};

export default UserBar;
