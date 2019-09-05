import { post } from '@/utils/request';
import api from '@/configs/apis';
import { urlf } from '@/utils/format';

export function uploadMedia(data) {
  const url = urlf(api.common.media);
  return post(url, data);
}
