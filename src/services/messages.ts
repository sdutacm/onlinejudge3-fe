import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetMessageListReq,
  IGetMessageListResp,
  IUpdateMessageReadReq,
  ISendMessageReq,
} from '@/common/contracts/message';

export function getList(query) {
  return post<IGetMessageListReq, IGetMessageListResp>(routesBe.getMessageList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.messages.list,
  });
}

export function markRead(messageId, read) {
  return post<IUpdateMessageReadReq, void>(routesBe.updateMessageRead.url, {
    messageId,
    read,
  });
}

export function send(data) {
  return post<ISendMessageReq, void>(routesBe.sendMessage.url, data);
}
