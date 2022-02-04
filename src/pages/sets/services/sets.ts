import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetSetListReq,
  IGetSetListResp,
  IGetSetDetailReq,
  IGetSetDetailResp,
  ICreateSetReq,
  ICreateSetResp,
  IUpdateSetDetailReq,
  IDeleteSetReq,
} from '@/common/contracts/set';

export function getList(query) {
  return post<IGetSetListReq, IGetSetListResp>(routesBe.getSetList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.sets.list,
  });
}

export function getDetail(setId) {
  return post<IGetSetDetailReq, IGetSetDetailResp>(routesBe.getSetDetail.url, {
    setId,
  });
}

export function addSet(data) {
  return post<ICreateSetReq, ICreateSetResp>(routesBe.createSet.url, data);
}

export function updateSet(setId: number, data) {
  return post<IUpdateSetDetailReq, void>(routesBe.updateSetDetail.url, {
    setId,
    ...data,
  });
}

export function deleteSet(setId: number) {
  return post<IDeleteSetReq, void>(routesBe.deleteSet.url, {
    setId,
  });
}
