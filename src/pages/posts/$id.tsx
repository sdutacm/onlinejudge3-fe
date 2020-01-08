import React from 'react';
import { Card, Skeleton } from 'antd';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import { filterXSS as xss } from 'xss';
import PageAnimation from '@/components/PageAnimation';
import PageTitle from '@/components/PageTitle';
import NotFound from '@/pages/404';

export interface Props extends ReduxProps, RouteProps {
  data: ITypeObject<IPost>;
}

interface State {
}

class PostDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  render() {
    const { loading, data: allData, match } = this.props;
    const id = ~~match.params.id;
    const data = allData[id] || {} as IPost;
    if (!loading && !data.postId) {
      return <NotFound />;
    }

    return (
      <PageAnimation>
        <PageTitle title={data.title} loading={loading}>
          <div className="content-view">
            <Card bordered={false} className="content-view">
              <Skeleton active loading={loading} paragraph={{ rows: 6, width: '100%' }}>
                <div className="post-content content-loaded">
                  <h2>{data.title}</h2>
                  <p>
                    <UserBar user={data.user} className="ant-comment-content-author-name" />
                    <span className="ml-md" />
                    <TimeBar time={data.createdAt * 1000} className="ant-comment-content-author-time" />
                  </p>
                  <div
                    dangerouslySetInnerHTML={{ __html: xss(data.content) }}
                    style={{ wordWrap: 'break-word', marginTop: '15px', marginBottom: '15px' }}
                  />
                </div>
              </Skeleton>
            </Card>
          </div>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['posts/getDetail'],
    data: state.posts.detail,
  };
}

export default connect(mapStateToProps)(PostDetail);
