import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import { IUploadMediaReq, IUploadMediaResp } from '@/common/contracts/misc';

export function uploadMedia(data) {
  return post<IUploadMediaReq, IUploadMediaResp>(routesBe.uploadMedia.url, data);
}
