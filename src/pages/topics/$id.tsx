import React from 'react';
import { Card, Comment, List, Form, Button, Skeleton, Upload, Icon } from 'antd';
import { connect } from 'dva';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import msg from '@/utils/msg';
import { filterXSS as xss } from 'xss';
import limits from '@/configs/limits';
import router from 'umi/router';
import { scroller } from 'react-scroll';
import PageAnimation from '@/components/PageAnimation';
import ProblemBar from '@/components/ProblemBar';
import RtEditor from '@/components/RtEditor';
import PageTitle from '@/components/PageTitle';
import NotFound from '@/pages/404';
import tracker from '@/utils/tracker';

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
    this.state = {
    };
  }

  componentWillReceiveProps(nextProps: Readonly<Props>): void {
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
              content: RtEditor.genEmptyContent(),
            });
            tracker.event({
              category: 'replies',
              action: 'add',
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
    if (!loading && !data.topicId) {
      return <NotFound />;
    }

    return (
      <PageAnimation>
        <PageTitle title={data.title} loading={loading}>
          <div className="content-view">
            <Card bordered={false} className="content-view">
              <Skeleton active loading={loading} paragraph={{ rows: 6, width: '100%' }}>
                <div className="topic-content content-loaded content-area">
                  <h2>{data.title}</h2>
                  {data.problem && <h4 style={{ marginBottom: '12px'}}>
                    <ProblemBar problem={data.problem} display="id-title" />
                  </h4>}
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

            {!loading && <Card bordered={false}>
              <div id="replies">
                <List
                  className="comment-list"
                  header={replies.count === 1 ? `${replies.count} reply` : `${replies.count} replies`}
                  itemLayout="horizontal"
                  loading={repliesLoading}
                  locale={{ emptyText: 'Be the first to reply!' }}
                  dataSource={replies.rows}
                  renderItem={item => (
                    <List.Item>
                      <Comment
                        author={<UserBar user={item.user} hideAvatar />}
                        avatar={<UserBar user={item.user} hideUsername />}
                        content={<div
                          dangerouslySetInnerHTML={{ __html: xss(item.content) }}
                          className="content-area"
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
                          callback('Please input content');
                        } else {
                          callback();
                        }
                      },
                    }],
                  })(
                    <RtEditor
                      form={form}
                      disabled={!session.loggedIn}
                      contentStyle={{ height: 220 }}
                    />
                  )}
                </Form.Item>
              </Form>

              <Button type="primary" onClick={this.handleSubmit} disabled={!session.loggedIn}>{session.loggedIn ? 'Reply' : 'Login to Reply'}</Button>
            </Card>}
          </div>
        </PageTitle>
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
