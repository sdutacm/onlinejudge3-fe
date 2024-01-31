import { ECompetitionUserRole } from '@/common/enums';
import pages from '@/configs/pages';

export function getCompetitionUserAvailablePages(obj: { role: ECompetitionUserRole }) {
  if (!obj) {
    return [];
  }
  switch (obj.role) {
    case ECompetitionUserRole.admin:
      return [
        {
          title: 'Settings',
          url: pages.competitions.baseSettings,
        },
        {
          title: 'Users',
          url: pages.competitions.userManagement,
        },
        {
          title: 'Problems',
          url: pages.competitions.problemSettings,
        },
        {
          title: 'Q&A',
          url: pages.competitions.qa,
        },
        {
          title: 'Notifications',
          url: pages.competitions.notificationManagement,
        },
        {
          title: 'Overview',
          url: pages.competitions.overview,
        },
        {
          title: 'Solutions',
          url: pages.competitions.solutions,
        },
        {
          title: 'Ranklist',
          url: pages.competitions.ranklist,
        },
      ];
    case ECompetitionUserRole.participant:
      return [
        {
          title: 'Overview',
          url: pages.competitions.overview,
        },
        {
          title: 'Solutions',
          url: pages.competitions.solutions,
        },
        {
          title: 'Ranklist',
          url: pages.competitions.ranklist,
        },
      ];
    case ECompetitionUserRole.principal:
      return [
        {
          title: 'Settings',
          url: pages.competitions.baseSettings,
        },
        {
          title: 'Problems',
          url: pages.competitions.problemSettings,
        },
        {
          title: 'Q&A',
          url: pages.competitions.qa,
        },
        {
          title: 'Notifications',
          url: pages.competitions.notificationManagement,
        },
        {
          title: 'Overview',
          url: pages.competitions.overview,
        },
        {
          title: 'Solutions',
          url: pages.competitions.solutions,
        },
        {
          title: 'Ranklist',
          url: pages.competitions.ranklist,
        },
      ];
    case ECompetitionUserRole.judge:
      return [
        {
          title: 'Q&A',
          url: pages.competitions.qa,
        },
        {
          title: 'Notifications',
          url: pages.competitions.notificationManagement,
        },
        {
          title: 'Overview',
          url: pages.competitions.overview,
        },
        {
          title: 'Solutions',
          url: pages.competitions.solutions,
        },
        {
          title: 'Ranklist',
          url: pages.competitions.ranklist,
        },
      ];
    case ECompetitionUserRole.auditor:
      return [
        {
          title: 'Audit',
          url: pages.competitions.audit,
        },
      ];
    case ECompetitionUserRole.fieldAssistantant:
      return [];
    case ECompetitionUserRole.volunteer:
      return [
        {
          title: 'Balloon',
          url: pages.competitions.balloon,
        },
      ];
    case ECompetitionUserRole.observer:
      return [
        {
          title: 'Overview',
          url: pages.competitions.overview,
        },
        {
          title: 'Solutions',
          url: pages.competitions.solutions,
        },
        {
          title: 'Ranklist',
          url: pages.competitions.ranklist,
        },
      ];
    default:
      return [];
  }
}

export function formatCompetitionUserSeatId({
  fieldShortName,
  seatNo,
}: {
  fieldShortName: string | null;
  seatNo: number | null;
}) {
  if (!fieldShortName || !seatNo) {
    return '';
  }
  return `${fieldShortName}-${seatNo}`;
}

export function getReadableVarScoreExpression(exp: string): string {
  return exp
    .replace(/Math\./g, '')
    .replace(/\$score/g, '{Base Score}')
    .replace(/\$problemIndex/g, '{Problem Index}')
    .replace(/\$elapsedTime\.h/g, '{Elapsed Hours}')
    .replace(/\$elapsedTime\.min/g, '{Elapsed Minutes}')
    .replace(/\$elapsedTime\.s/g, '{Elapsed Seconds}')
    .replace(/\$tries/g, '{Tries}');
}

export function getReadableVarScoreExpressionZh(exp: string): string {
  return exp
    .replace(/Math\./g, '')
    .replace(/\$score/g, '{基础分数}')
    .replace(/\$problemIndex/g, '{题目编号}')
    .replace(/\$elapsedTime\.h/g, '{耗时（小时）}')
    .replace(/\$elapsedTime\.min/g, '{耗时（分钟）}')
    .replace(/\$elapsedTime\.s/g, '{耗时（秒）}')
    .replace(/\$tries/g, '{尝试次数}');
}
