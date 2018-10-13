import React from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';

interface Props {
  user: User;
}

const UserBar: React.StatelessComponent<Props> = ({ user }) => {
  return (
    <Link to="/" onClick={e => e.stopPropagation()}>
      <Avatar size="small" icon="user" src={user.avatar} /><span style={{ marginLeft: '8px' }}>{user.nickname}</span>
    </Link>
  );
};

export default UserBar;
