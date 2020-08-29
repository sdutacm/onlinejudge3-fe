import { post } from '@/utils/request';
import { routesBe } from '@/common/routes';
import limits from '@/configs/limits';
import { IGetPostListReq, IGetPostListResp, IGetPostDetailReq, IGetPostDetailResp } from '@/common/contracts/post';

export function getList(query) {
  return post<IGetPostListReq, IGetPostListResp>(routesBe.getPostList.url, {
    ...query,
    page: query.page || 1,
    limit: query.limit || limits.posts.list,
  });
}

export function getDetail(postId) {
  return post<IGetPostDetailReq, IGetPostDetailResp>(routesBe.getPostDetail.url, {
    postId,
  });
}
