import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import {
  IGetFavoriteListReq,
  IGetFavoriteListResp,
  IAddFavoriteReq,
  IAddFavoriteResp,
  IDeleteFavoriteReq,
} from '@/common/contracts/favorite';

export function getList(userId, query) {
  return post<IGetFavoriteListReq, IGetFavoriteListResp>(routesBe.getFavoriteList.url, {
    ...query,
  });
}

export function addFavorite(data) {
  return post<IAddFavoriteReq, IAddFavoriteResp>(routesBe.addFavorite.url, data);
}

export function deleteFavorite(favoriteId) {
  return post<IDeleteFavoriteReq, void>(routesBe.deleteFavorite.url, {
    favoriteId,
  });
}
