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
