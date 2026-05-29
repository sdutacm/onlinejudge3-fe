import React from 'react';
import { Popover } from 'antd';
import { ICompetitionUser, ICompetitionUserInfo } from '@/common/interfaces/competition';

const competitionUserInfoLabelMap = {
  nickname: 'Nickname',
  subname: 'Subname',
  realName: 'Name',
  organization: 'Organization',
  company: 'Company',
  studentNo: 'Student No.',
  school: 'School',
  college: 'College',
  major: 'Major',
  class: 'Class',
  tel: 'Tel',
  qq: 'QQ',
  weChat: 'WeChat',
  clothing: 'Clothing',
  slogan: 'Slogan',
  group: 'Group',
};

const competitionUserInfoIdentityFields = ['organization', 'school', 'class', 'realName', 'studentNo'];
const competitionUserInfoContactFields = ['tel', 'qq', 'weChat', 'clothing'];

interface CompetitionUserInfoEntry {
  key: string;
  label: string;
  value: string;
}

interface Props {
  user: ICompetitionUser;
}

function isEmptyCompetitionUserInfoValue(value) {
  return value === undefined || value === null || value === '';
}

function formatCompetitionUserInfoValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value);
  }
  return `${value}`;
}

function getCompetitionUserInfoLabel(field: string) {
  const memberMatch = field.match(/^members\.(\d+)\.(.+)$/);
  if (memberMatch) {
    return `Member ${Number(memberMatch[1]) + 1} ${getCompetitionUserInfoLabel(memberMatch[2])}`;
  }
  return competitionUserInfoLabelMap[field] || field;
}

function renderCompetitionUserInfoSummaryLine(info: ICompetitionUserInfo, fields: string[]) {
  return fields
    .map((field) => {
      const value = info[field];
      if (isEmptyCompetitionUserInfoValue(value)) {
        return null;
      }
      return `${getCompetitionUserInfoLabel(field)}: ${formatCompetitionUserInfoValue(value)}`;
    })
    .filter((item) => !!item)
    .join(' | ');
}

function collectCompetitionUserInfoEntries(info, parentKey = ''): CompetitionUserInfoEntry[] {
  if (!info || typeof info !== 'object') {
    return [];
  }
  let entries: CompetitionUserInfoEntry[] = [];
  Object.keys(info).forEach((key) => {
    const value = info[key];
    if (isEmptyCompetitionUserInfoValue(value)) {
      return;
    }
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (Array.isArray(value)) {
      if (!value.length) {
        return;
      }
      value.forEach((item, index) => {
        const itemKey = `${fullKey}.${index}`;
        if (item && typeof item === 'object') {
          entries = entries.concat(collectCompetitionUserInfoEntries(item, itemKey));
        } else if (!isEmptyCompetitionUserInfoValue(item)) {
          entries.push({
            key: itemKey,
            label: getCompetitionUserInfoLabel(itemKey),
            value: formatCompetitionUserInfoValue(item),
          });
        }
      });
      return;
    }
    if (typeof value === 'object') {
      const childEntries = collectCompetitionUserInfoEntries(value, fullKey);
      if (childEntries.length) {
        entries = entries.concat(childEntries);
      } else {
        entries.push({
          key: fullKey,
          label: getCompetitionUserInfoLabel(fullKey),
          value: formatCompetitionUserInfoValue(value),
        });
      }
      return;
    }
    entries.push({
      key: fullKey,
      label: getCompetitionUserInfoLabel(fullKey),
      value: formatCompetitionUserInfoValue(value),
    });
  });
  return entries;
}

function isCompetitionUserInfoSloganEntry(entry: CompetitionUserInfoEntry) {
  return entry.key === 'slogan' || entry.key.endsWith('.slogan');
}

function sortCompetitionUserInfoEntries(entries: CompetitionUserInfoEntry[]) {
  const normalEntries = entries.filter((entry) => !isCompetitionUserInfoSloganEntry(entry));
  const sloganEntries = entries.filter((entry) => isCompetitionUserInfoSloganEntry(entry));
  return normalEntries.concat(sloganEntries);
}

function renderCompetitionUserInfoPopover(info: ICompetitionUserInfo) {
  const entries = sortCompetitionUserInfoEntries(collectCompetitionUserInfoEntries(info));
  if (!entries.length) {
    return <span className="text-secondary">No info</span>;
  }
  return (
    <div className="competition-user-info-popover-content">
      {entries.map((entry) => (
        <div className="competition-user-info-popover-row" key={entry.key}>
          <span className="competition-user-info-popover-label text-secondary">{entry.label}</span>
          <span className="competition-user-info-popover-value">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function CompetitionUserInfo({ user }: Props) {
  const info = user.info || ({} as ICompetitionUserInfo);
  const title = info.nickname || '--';
  const identityText = renderCompetitionUserInfoSummaryLine(info, competitionUserInfoIdentityFields);
  const contactText = renderCompetitionUserInfoSummaryLine(info, competitionUserInfoContactFields);

  const summary = (
    <div className="competition-user-info-trigger">
      <div className="competition-user-info-title text-ellipsis">{title}</div>
      {identityText ? (
        <div className="competition-user-info-meta text-secondary text-ellipsis">{identityText}</div>
      ) : null}
      {contactText ? (
        <div className="competition-user-info-meta text-secondary text-ellipsis">{contactText}</div>
      ) : null}
      {info.slogan ? (
        <div className="competition-user-info-slogan text-secondary text-ellipsis">
          「{info.slogan}」
        </div>
      ) : null}
    </div>
  );

  return (
    <Popover
      title={title}
      content={renderCompetitionUserInfoPopover(info)}
      placement="topLeft"
      overlayClassName="competition-user-info-popover"
    >
      {summary}
    </Popover>
  );
}

export default CompetitionUserInfo;
