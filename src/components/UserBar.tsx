import React from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import { urlf } from '@/utils/format';
import constants from '@/configs/constants';

interface Props {
  user: IUser;
  isContestUser?: boolean;
}

const UserBar: React.StatelessComponent<Props> = ({ user, isContestUser }) => {
  const inner = <span>
    <Avatar size="small" icon="user" src={`${constants.avatarUrlPrefix}${user.avatar}`} /><span style={{ marginLeft: '8px' }}>{user.nickname}</span>
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
