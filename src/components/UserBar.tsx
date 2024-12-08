import React from 'react';
import { Avatar, Icon, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import pages from '@/configs/pages';
import { formatAvatarUrl, urlf } from '@/utils/format';
import classNames from 'classnames';
import { getRatingLevel } from '@/utils/rating';
import { EUserType } from '@/common/enums';

export interface Props {
  user: IUser | IUserLite;
  isContestUser?: boolean;
  hideAvatar?: boolean;
  hideName?: boolean;
  className?: string;
  disableJump?: boolean;
  showAsText?: boolean;
  showRating?: boolean;
  useTooltip?: boolean;
  tabindex?: number;
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
  useTooltip = false,
  tabindex,
  nameFormat,
  className,
}) => {
  if (!user) {
    return <span>--</span>;
  }
  const isTeam = user.type === EUserType.team;
  const avatar = !hideAvatar ? (
    <Avatar size="small" icon="user" src={formatAvatarUrl(user.avatar)} />
  ) : null;
  const teamBadge = isTeam ? <Icon type="team" className="ml-sm-md" /> : null;
  const username = !hideName ? (
    <span style={{ marginLeft: hideAvatar ? '0' : '8px' }}>
      {nameFormat?.(user) ?? user.nickname}
    </span>
  ) : null;
  const rating = user.rating;
  const userRatingLevel = getRatingLevel(rating);
  const ratingStyle =
    showRating && userRatingLevel ? { color: userRatingLevel.color, fontWeight: 500 } : {};
  const inner = (
    <span className={classNames('no-wrap', className)} style={ratingStyle}>
      {avatar}
      {username}
      {teamBadge}
    </span>
  );
  if (isContestUser || showAsText) {
    return inner;
  }
  const extraAttrs: any = {};
  if (tabindex) {
    extraAttrs.tabIndex = tabindex;
  }
  if (disableJump) {
    return <a {...extraAttrs}>{inner}</a>;
  }
  return (
    <Link
      to={urlf(pages.users.detail, { param: { id: user.userId } })}
      onClick={(e) => e.stopPropagation()}
      {...extraAttrs}
    >
      {useTooltip ? <Tooltip title={nameFormat?.(user) ?? user.nickname}>{inner}</Tooltip> : inner}
    </Link>
  );
};

export default UserBar;
