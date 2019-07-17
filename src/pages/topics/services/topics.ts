import { get, post } from '@/utils/request';
import api from '@/configs/apis';
import limits from '@/configs/limits';
import { urlf } from '@/utils/format';

export function getList(query) {
  const url = urlf(api.topics.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.topics.list,
    },
  });
  return get(url);
}

export function getDetail(id) {
  const url = urlf(api.topics.detail, { param: { id } });
  return get(url, 1000);
}

export function getTopicReplies(id, query) {
  const url = urlf(api.topics.replies, {
    param: {
      id,
    },
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.topics.replies,
    },
  });
  return get(url);
}

export function getReplies(query) {
  const url = urlf(api.replies.base, {
    query: {
      ...query,
      page: query.page || 1,
      limit: limits.replies.inUserDetailList,
    },
  });
  return get(url);
}

export function addTopic(data) {
  const url = urlf(api.topics.base);
  return post(url, data);
}

export function addTopicReply(id, data) {
  const url = urlf(api.topics.replies, { param: { id } });
  return post(url, data);
}
