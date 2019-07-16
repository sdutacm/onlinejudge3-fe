import React from 'react';
import { Card, Comment, List, Form, Button, Input, Avatar } from 'antd';
import { connect } from 'dva';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import PageLoading from '@/components/PageLoading';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import msg from '@/utils/msg';
import { filterXSS as xss } from 'xss';
import { formatAvatarUrl } from '@/utils/format';

export interface Props extends ReduxProps, RouteProps, FormProps {
  data: ITypeObject<ITopic>;
  session: ISessionStatus;
  repliesLoading: boolean;
  replies: IList<IReply>;
}

interface State {
}

class TopicDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // componentDidMount(): void {
  //   window.scrollTo(0, 0);
  // }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    // 当用户态显现
    if (!this.props.session.loggedIn && nextProps.session.loggedIn) {
      nextProps.dispatch({
        type: 'topics/getDetail',
        payload: {
          id: getPathParamId(nextProps.location.pathname, pages.topics.detail),
          force: true,
        },
      });
    }
  }

  handleSubmit = () => {
    const { form, match, dispatch, location } = this.props;
    const postId = ~~match.params.id;
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'topics/createReply',
          payload: { ...values, postId },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Reply successfully');
            dispatch({
              type: 'topics/getReplies',
              payload: {
                id: postId,
                query: location.query,
              },
            });
            form.resetFields();
          }
        });
      }
    });
  };

  render() {
    const { loading, data: allData, session, match, repliesLoading, replies, form } = this.props;
    const { getFieldDecorator } = form;
    const id = ~~match.params.id;
    const data = allData[id] || {} as ITopic;
    if (loading) {
      return <PageLoading />;
    }
    return (
      <Card bordered={false} className="content-view-sm">
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
        {repliesLoading ? null : <List
          className="comment-list"
          header={replies.count === 1 ? `${replies.count} reply` : `${replies.count} replies`}
          itemLayout="horizontal"
          dataSource={replies.rows}
          renderItem={item => (
            <li>
              <Comment
                author={<UserBar user={item.user} hideAvatar />}
                avatar={<Avatar size="small" icon="user" src={formatAvatarUrl(item.user.avatar)} />}
                content={<div
                  dangerouslySetInnerHTML={{ __html: xss(item.content) }}
                  style={{ wordWrap: 'break-word', marginTop: '8px' }}
                />}
                datetime={<TimeBar time={item.createdAt * 1000} />}
              />
            </li>
          )}
        />}

        <Form layout="vertical" hideRequiredMark={true} style={{ marginTop: '15px' }}>
          <Form.Item label="Reply your thoughts...">
            {getFieldDecorator('content', {
              rules: [{ required: true, message: 'Please enter content' }],
            })(<Input.TextArea rows={4} disabled={!session.loggedIn} />)}
          </Form.Item>
        </Form>
        <Button type="primary" onClick={this.handleSubmit} disabled={!session.loggedIn}>{session.loggedIn ? 'Reply' : 'Login to Reply'}</Button>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    session: state.session,
    loading: !!state.loading.effects['topics/getDetail'],
    data: state.topics.detail,
    repliesLoading: !!state.loading.effects['topics/getTopicReplies'],
    replies: state.topics.topicReplies,
  };
}

export default connect(mapStateToProps)(Form.create()(TopicDetail));
