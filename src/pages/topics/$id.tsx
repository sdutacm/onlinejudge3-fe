import React from 'react';
import { Card, Comment, List, Form, Button, Input, Avatar, Skeleton } from 'antd';
import { connect } from 'dva';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import msg from '@/utils/msg';
import { filterXSS as xss } from 'xss';
import { formatAvatarUrl } from '@/utils/format';
import limits from '@/configs/limits';
import router from 'umi/router';
import { scroller } from 'react-scroll';
import PageAnimation from '@/components/PageAnimation';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';

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

  handlePageChange = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
    scroller.scrollTo('replies', {
      duration: 500,
      smooth: true,
      offset: -64,
    });
  };

  handleSubmit = () => {
    const { form, match, dispatch } = this.props;
    const topicId = ~~match.params.id;
    form.validateFields((err, values) => {
      if (!err) {
        const v = {
          ...values,
          content: values.content.toHTML(),
        };
        dispatch({
          type: 'topics/addReply',
          payload: {
            id: topicId,
            data: v,
          },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Reply successfully');
            dispatch({
              type: 'topics/getTopicReplies',
              payload: {
                id: topicId,
                // query: location.query,
                getLast: true,
              },
            });
            // form.resetFields();
            form.setFieldsValue({
              content: BraftEditor.createEditorState(null),
            });
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
    return (
      <PageAnimation>
        <Card bordered={false} className="content-view-sm">
          <Skeleton active loading={loading} paragraph={{ rows: 8, width: '100%' }}>
            <div>
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

            <div id="replies">
              <List
                className="comment-list"
                header={replies.count === 1 ? `${replies.count} reply` : `${replies.count} replies`}
                itemLayout="horizontal"
                loading={repliesLoading}
                locale={{ emptyText: 'Void' }}
                dataSource={replies.rows}
                renderItem={item => (
                  <List.Item>
                    <Comment
                      author={<UserBar user={item.user} hideAvatar />}
                      avatar={<Avatar size="small" icon="user" src={formatAvatarUrl(item.user.avatar)} />}
                      content={<div
                        dangerouslySetInnerHTML={{ __html: xss(item.content) }}
                        style={{ wordWrap: 'break-word', marginTop: '8px' }}
                      />}
                      datetime={<TimeBar time={item.createdAt * 1000} />}
                    />
                  </List.Item>
                )}
                pagination={{
                  className: 'ant-table-pagination',
                  total: replies.count,
                  current: replies.page,
                  pageSize: limits.topics.replies,
                  onChange: this.handlePageChange,
                }}
              />
              <div className="clearfix" />
            </div>

            <Form layout="vertical" hideRequiredMark={true}>
              <Form.Item label="Write your thoughts...">
                {getFieldDecorator('content', {
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: true,
                    validator: (_, value, callback) => {
                      if (value.isEmpty()) {
                        callback('Please enter content');
                      } else {
                        callback();
                      }
                    },
                  }],
                })(
                  // @ts-ignore
                  <BraftEditor
                    controls={[
                      'headings', 'bold', 'italic', 'underline', 'list-ul', 'list-ol',
                      'emoji', 'code', 'link', 'separator',
                      'undo', 'redo',
                    ]}
                    className="rt-editor"
                    language="en"
                    disabled={!session.loggedIn}
                    contentStyle={{ height: 220 }}
                  />
                )}
              </Form.Item>
            </Form>

            <Button type="primary" onClick={this.handleSubmit} disabled={!session.loggedIn}>{session.loggedIn ? 'Reply' : 'Login to Reply'}</Button>
          </Skeleton>
        </Card>
      </PageAnimation>
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
