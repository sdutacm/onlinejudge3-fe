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
  IGetCompetitionSettingsReq,
  IGetCompetitionSettingsResp,
  IGetCompetitionProblemsReq,
  IGetCompetitionProblemsResp,
  IGetCompetitionProblemConfigReq,
  IGetCompetitionProblemConfigResp,
  ISetCompetitionProblemConfigReq,
  IGetCompetitionProblemSolutionStatsReq,
  IGetCompetitionProblemSolutionStatsResp,
  IGetCompetitionUserDetailReq,
  IGetCompetitionUserDetailResp,
  IGetSelfCompetitionUserDetailReq,
  IGetSelfCompetitionUserDetailResp,
  IConfirmEnterCompetitionReq,
  IConfirmQuitCompetitionReq,
  IBatchCreateCompetitionUsersReq,
  ICreateCompetitionUserReq,
  IUpdateCompetitionUserReq,
  IRandomAllCompetitionUserPasswordsReq,
  IUpdateCompetitionDetailReq,
  IUpdateCompetitionSettingsReq,
  IGetCompetitionNotificationsReq,
  IGetCompetitionNotificationsResp,
  ICreateCompetitionNotificationReq,
  IDeleteCompetitionNotificationReq,
  IGetCompetitionQuestionsReq,
  IGetCompetitionQuestionsResp,
  IGetSelfCompetitionQuestionsReq,
  IGetSelfCompetitionQuestionsResp,
  ICreateCompetitionQuestionReq,
  IReplyCompetitionQuestionReq,
  IGetCompetitionRanklistReq,
  IGetCompetitionRanklistResp,
  IGetCompetitionRatingStatusReq,
  IGetCompetitionRatingStatusResp,
  IEndCompetitionReq,
} from '@/common/contracts/competition';
import { ICompetition } from '@/common/interfaces/competition';
import {
  IGetCompetitionBalloonsReq,
  IGetCompetitionBalloonsResp,
  IUpdateCompetitionBalloonStatusReq,
} from '@/common/contracts/balloon';

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

export function updateCompetitionDetail(competitionId, data) {
  return post<IUpdateCompetitionDetailReq, void>(routesBe.updateCompetitionDetail.url, {
    ...data,
    competitionId,
  });
}

export function getSettings(competitionId) {
  return post<IGetCompetitionSettingsReq, IGetCompetitionSettingsResp>(
    routesBe.getCompetitionSettings.url,
    {
      competitionId,
    },
  );
}

export function updateSettings(competitionId, data) {
  return post<IUpdateCompetitionSettingsReq, void>(routesBe.updateCompetitionSettings.url, {
    ...data,
    competitionId,
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
  return post<ISignUpCompetitionParticipantReq, void>(routesBe.signUpCompetitionParticipant.url, {
    ...data,
    competitionId,
  });
}

export function modifySignedUpCompetitionParticipant(competitionId, data) {
  return post<IModifySignedUpCompetitionParticipantReq, void>(
    routesBe.modifySignedUpCompetitionParticipant.url,
    {
      ...data,
      competitionId,
    },
  );
}

export function batchCreateCompetitionUsers(competitionId, data) {
  return post<IBatchCreateCompetitionUsersReq, void>(routesBe.batchCreateCompetitionUsers.url, {
    ...data,
    competitionId,
  });
}

export function createCompetitionUser(competitionId, userId, data) {
  return post<ICreateCompetitionUserReq, void>(routesBe.createCompetitionUser.url, {
    ...data,
    competitionId,
    userId,
  });
}

export function updateCompetitionUser(competitionId, userId, data) {
  return post<IUpdateCompetitionUserReq, void>(routesBe.updateCompetitionUser.url, {
    ...data,
    competitionId,
    userId,
  });
}

export function getCompetitionUsers(competitionId, query) {
  return post<IGetCompetitionUsersReq, IGetCompetitionUsersResp>(routesBe.getCompetitionUsers.url, {
    ...query,
    competitionId,
  });
}

export function getUserDetail(competitionId, userId) {
  return post<IGetCompetitionUserDetailReq, IGetCompetitionUserDetailResp>(
    routesBe.getCompetitionDetail.url,
    {
      competitionId,
      userId,
    },
  );
}

export function getSelfUserDetail(competitionId) {
  return post<IGetSelfCompetitionUserDetailReq, IGetSelfCompetitionUserDetailResp>(
    routesBe.getSelfCompetitionUserDetail.url,
    {
      competitionId,
    },
  );
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
  return post<IAuditCompetitionParticipantReq, void>(routesBe.auditCompetitionParticipant.url, {
    ...data,
    competitionId,
    userId,
  });
}

export function getProblems(competitionId) {
  return post<IGetCompetitionProblemsReq, IGetCompetitionProblemsResp>(
    routesBe.getCompetitionProblems.url,
    {
      competitionId,
    },
  );
}

export function getProblemResultStats(competitionId) {
  return post<IGetCompetitionProblemSolutionStatsReq, IGetCompetitionProblemSolutionStatsResp>(
    routesBe.getCompetitionProblemSolutionStats.url,
    {
      competitionId,
    },
  );
}

export function getProblemConfig(competitionId) {
  return post<IGetCompetitionProblemConfigReq, IGetCompetitionProblemConfigResp>(
    routesBe.getCompetitionProblemConfig.url,
    {
      competitionId,
    },
  );
}

export function setProblemConfig(competitionId, data) {
  return post<ISetCompetitionProblemConfigReq, void>(routesBe.setCompetitionProblemConfig.url, {
    ...data,
    competitionId,
  });
}

export function confirmEnter(competitionId) {
  return post<IConfirmEnterCompetitionReq, void>(routesBe.confirmEnterCompetition.url, {
    competitionId,
  });
}

export function confirmQuit(competitionId) {
  return post<IConfirmQuitCompetitionReq, void>(routesBe.confirmQuitCompetition.url, {
    competitionId,
  });
}

export function randomAllCompetitionUserPasswords(competitionId) {
  return post<IRandomAllCompetitionUserPasswordsReq, void>(
    routesBe.randomAllCompetitionUserPasswords.url,
    {
      competitionId,
    },
  );
}

export function getCompetitionBalloons(competitionId) {
  return post<IGetCompetitionBalloonsReq, IGetCompetitionBalloonsResp>(
    routesBe.getCompetitionBalloons.url,
    {
      competitionId,
    },
  );
}

export function updateCompetitionBalloonStatus(competitionId, balloonId, data) {
  return post<IUpdateCompetitionBalloonStatusReq, void>(
    routesBe.updateCompetitionBalloonStatus.url,
    {
      ...data,
      balloonId,
      competitionId,
    },
  );
}

export function getCompetitionNotifications(competitionId) {
  return post<IGetCompetitionNotificationsReq, IGetCompetitionNotificationsResp>(
    routesBe.getCompetitionNotifications.url,
    {
      competitionId,
    },
  );
}

export function createCompetitionNotification(competitionId, data) {
  return post<ICreateCompetitionNotificationReq, void>(routesBe.createCompetitionNotification.url, {
    ...data,
    competitionId,
  });
}

export function deleteCompetitionNotification(competitionId, competitionNotificationId) {
  return post<IDeleteCompetitionNotificationReq, void>(routesBe.deleteCompetitionNotification.url, {
    competitionId,
    competitionNotificationId,
  });
}

export function getCompetitionQuestions(competitionId) {
  return post<IGetCompetitionQuestionsReq, IGetCompetitionQuestionsResp>(
    routesBe.getCompetitionQuestions.url,
    {
      competitionId,
    },
  );
}

export function getSelfCompetitionQuestions(competitionId) {
  return post<IGetSelfCompetitionQuestionsReq, IGetSelfCompetitionQuestionsResp>(
    routesBe.getSelfCompetitionQuestions.url,
    {
      competitionId,
    },
  );
}

export function createCompetitionQuestion(competitionId, data) {
  return post<ICreateCompetitionQuestionReq, void>(routesBe.createCompetitionQuestion.url, {
    ...data,
    competitionId,
  });
}

export function replyCompetitionQuestion(competitionId, competitionQuestionId, data) {
  return post<IReplyCompetitionQuestionReq, void>(routesBe.replyCompetitionQuestion.url, {
    ...data,
    competitionId,
    competitionQuestionId,
  });
}

export function getCompetitionRanklist(competitionId, god = false) {
  return post<IGetCompetitionRanklistReq, IGetCompetitionRanklistResp>(routesBe.getCompetitionRanklist.url, {
    competitionId,
    god,
  });
}

export function getRatingStatus(competitionId) {
  return post<IGetCompetitionRatingStatusReq, IGetCompetitionRatingStatusResp>(
    routesBe.getCompetitionRatingStatus.url,
    {
      competitionId,
    },
  );
}

export function endCompetition(competitionId) {
  return post<IEndCompetitionReq, void>(routesBe.endCompetition.url, {
    competitionId,
  });
}
