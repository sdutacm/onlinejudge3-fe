import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import {
  ISendEmailVerificationReq,
  ISendEmailVerificationResp,
} from '@/common/contracts/verification';

export function fetchEmailCode(data) {
  return post<ISendEmailVerificationReq, ISendEmailVerificationResp>(
    routesBe.sendEmailVerification.url,
    data,
  );
}
