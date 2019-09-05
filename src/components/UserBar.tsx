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
  hideUsername?: boolean;
  className?: string;
}

const UserBar: React.FC<Props> = ({ user, isContestUser = false, hideAvatar = false, hideUsername = false, className }) => {
  const avatar = !hideAvatar ? <Avatar size="small" icon="user" src={formatAvatarUrl(user.avatar)} /> : null;
  const username = !hideUsername ? <span style={{ marginLeft: hideAvatar ? '0' : '8px' }}>{user.nickname}</span> : null;
  const inner = <span className={classNames('no-wrap', className)}>
    {avatar}{username}
  </span>;
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
