import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';

export function uploadMedia(data) {
  return post(routesBe.uploadMedia.url, data);
}
