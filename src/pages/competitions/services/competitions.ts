import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetCompetitionListReq,
  IGetCompetitionListResp,
  IGetCompetitionSessionReq,
  IGetCompetitionSessionResp,
  ILoginCompetitionReq,
  ILoginCompetitionResp,
  ILogoutCompetitionReq,
  IGetCompetitionDetailReq,
  IGetCompetitionDetailResp,
  IGetSignedUpCompetitionParticipantReq,
  IGetSignedUpCompetitionParticipantResp,
  ISignUpCompetitionParticipantReq,
  IModifySignedUpCompetitionParticipantReq,
  IGetCompetitionUsersReq,
  IGetCompetitionUsersResp,
  IGetPublicCompetitionParticipantsReq,
  IGetPublicCompetitionParticipantsResp,
  IGetPublicCompetitionParticipantDetailReq,
  IGetPublicCompetitionParticipantDetailResp,
  IAuditCompetitionParticipantReq,
} from '@/common/contracts/competition';
import { ICompetition } from '@/common/interfaces/competition';

function formatCompetition(competition: ICompetition) {
  if (!competition) {
    return competition;
  }
  return {
    ...competition,
    startAt: competition.startAt ? new Date(competition.startAt) : null,
    endAt: competition.endAt ? new Date(competition.endAt) : null,
    registerStartAt: competition.registerStartAt ? new Date(competition.registerStartAt) : null,
    registerEndAt: competition.registerEndAt ? new Date(competition.registerEndAt) : null,
  };
}

export function getList(query) {
  return post<IGetCompetitionListReq, IGetCompetitionListResp>(routesBe.getCompetitionList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.posts.list,
  }).then((res) => {
    if (res.success && Array.isArray(res.data?.rows)) {
      // @ts-ignore unsafe
      res.data.rows = res.data.rows.map(formatCompetition);
    }
    return res;
  });
}

export function getSession(competitionId) {
  return post<IGetCompetitionSessionReq, IGetCompetitionSessionResp>(
    routesBe.getCompetitionSession.url,
    {
      competitionId,
    },
  );
}

export function login(competitionId, data) {
  return post<ILoginCompetitionReq, ILoginCompetitionResp>(routesBe.loginCompetition.url, {
    ...data,
    competitionId,
  });
}

export function logout(competitionId) {
  return post<ILogoutCompetitionReq, void>(routesBe.logoutCompetition.url, {
    competitionId,
  });
}

export function getDetail(competitionId) {
  return post<IGetCompetitionDetailReq, IGetCompetitionDetailResp>(
    routesBe.getCompetitionDetail.url,
    {
      competitionId,
    },
  ).then((res) => {
    if (res.success && res.data) {
      // @ts-ignore unsafe
      res.data = formatCompetition(res.data);
    }
    return res;
  });
}

export function getSignedUpCompetitionParticipant(competitionId) {
  return post<IGetSignedUpCompetitionParticipantReq, IGetSignedUpCompetitionParticipantResp>(
    routesBe.getSignedUpCompetitionParticipant.url,
    {
      competitionId,
    },
  );
}

export function signUpCompetitionParticipant(competitionId, data) {
  return post<ISignUpCompetitionParticipantReq, null>(routesBe.signUpCompetitionParticipant.url, {
    ...data,
    competitionId,
  });
}

export function modifySignedUpCompetitionParticipant(competitionId, data) {
  return post<IModifySignedUpCompetitionParticipantReq, null>(
    routesBe.modifySignedUpCompetitionParticipant.url,
    {
      ...data,
      competitionId,
    },
  );
}

export function getCompetitionUsers(competitionId, query) {
  return post<IGetCompetitionUsersReq, IGetCompetitionUsersResp>(routesBe.getCompetitionUsers.url, {
    ...query,
    competitionId,
  });
}

export function getPublicCompetitionParticipants(competitionId) {
  return post<IGetPublicCompetitionParticipantsReq, IGetPublicCompetitionParticipantsResp>(
    routesBe.getPublicCompetitionParticipants.url,
    {
      competitionId,
    },
  );
}

export function getPublicCompetitionParticipantDetail(competitionId, userId) {
  return post<
    IGetPublicCompetitionParticipantDetailReq,
    IGetPublicCompetitionParticipantDetailResp
  >(routesBe.getPublicCompetitionParticipantDetail.url, {
    competitionId,
    userId,
  });
}

export function auditCompetitionParticipant(competitionId, userId, data) {
  return post<IAuditCompetitionParticipantReq, null>(routesBe.auditCompetitionParticipant.url, {
    ...data,
    competitionId,
    userId,
  });
}
