import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetCompetitionListReq,
  IGetCompetitionListResp,
  IGetCompetitionDetailReq,
  IGetCompetitionDetailResp,
  IGetSignedUpCompetitionParticipantReq,
  IGetSignedUpCompetitionParticipantResp,
  ISignUpCompetitionParticipantReq,
  IModifySignedUpCompetitionParticipantReq,
} from '@/common/contracts/competition';

export function getList(query) {
  return post<IGetCompetitionListReq, IGetCompetitionListResp>(routesBe.getCompetitionList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.posts.list,
  });
}

export function getDetail(competitionId) {
  return post<IGetCompetitionDetailReq, IGetCompetitionDetailResp>(
    routesBe.getCompetitionDetail.url,
    {
      competitionId,
    },
  );
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
