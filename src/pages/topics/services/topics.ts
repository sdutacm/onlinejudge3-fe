import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import {
  IGetTopicListReq,
  IGetTopicListResp,
  IGetTopicDetailReq,
  IGetTopicDetailResp,
  ICreateTopicReq,
  ICreateTopicResp,
} from '@/common/contracts/topic';
import {
  IGetReplyListReq,
  IGetReplyListResp,
  ICreateReplyReq,
  ICreateReplyResp,
} from '@/common/contracts/reply';

export function getList(query) {
  return post<IGetTopicListReq, IGetTopicListResp>(routesBe.getTopicList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.topics.list,
  });
}

export function getDetail(topicId) {
  return post<IGetTopicDetailReq, IGetTopicDetailResp>(routesBe.getTopicDetail.url, {
    topicId,
  });
}

export function getTopicReplies(topicId, query) {
  return post<IGetReplyListReq, IGetReplyListResp>(routesBe.getReplyList.url, {
    ...query,
    topicId,
    page: query.page || 1,
    limit: query.limit || limits.topics.replies,
  });
}

export function getReplies(query) {
  return post<IGetReplyListReq, IGetReplyListResp>(routesBe.getReplyList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.replies.inUserDetailList,
  });
}

export function addTopic(data) {
  return post<ICreateTopicReq, ICreateTopicResp>(routesBe.createTopic.url, data);
}

export function addTopicReply(topicId, data) {
  return post<ICreateReplyReq, ICreateReplyResp>(routesBe.createReply.url, {
    topicId,
    ...data,
  });
}
