import React from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import { formatAvatarUrl, urlf } from '@/utils/format';
import classNames from 'classnames';
import { getRatingLevel } from '@/utils/rating';

export interface Props {
  user: IUser | IUserLite;
  isContestUser?: boolean;
  hideAvatar?: boolean;
  hideName?: boolean;
  className?: string;
  disableJump?: boolean;
  showAsText?: boolean;
  showRating?: boolean;
  nameFormat?: (user: IUser) => string;
}

const UserBar: React.FC<Props> = ({
  user,
  isContestUser = false,
  hideAvatar = false,
  hideName = false,
  disableJump = false,
  showAsText = false,
  showRating = false,
  nameFormat,
  className,
}) => {
  if (!user) {
    return <span>--</span>;
  }
  const avatar = !hideAvatar ? (
    <Avatar size="small" icon="user" src={formatAvatarUrl(user.avatar)} />
  ) : null;
  const username = !hideName ? (
    <span style={{ marginLeft: hideAvatar ? '0' : '8px' }}>{nameFormat?.(user) ?? user.nickname}</span>
  ) : null;
  const rating = user.rating;
  const userRatingLevel = getRatingLevel(rating);
  const ratingStyle =
    showRating && userRatingLevel ? { color: userRatingLevel.color, fontWeight: 500 } : {};
  const inner = (
    <span className={classNames('no-wrap', className)} style={ratingStyle}>
      {avatar}
      {username}
    </span>
  );
  if (isContestUser || showAsText) {
    return inner;
  }
  if (disableJump) {
    return <a>{inner}</a>;
  }
  return (
    <Link
      to={urlf(pages.users.detail, { param: { id: user.userId } })}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  );
};

export default UserBar;
