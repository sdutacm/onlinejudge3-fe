import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import { IGetAchievementRateResp } from '@/common/contracts/achievement';

export function getAchievementRate() {
  return post<void, IGetAchievementRateResp>(routesBe.getAchievementRate.url);
}

export function requestAchievementPush() {
  return post<void, void>(routesBe.requestAchievementPush.url);
}
