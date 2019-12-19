/**
 * title: Topics
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Row, Col, Card, Form, Button, Input } from 'antd';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps, FormProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import UserBar from '@/components/UserBar';
import TimeBar from '@/components/TimeBar';
import ProblemBar from '@/components/ProblemBar';
import PageAnimation from '@/components/PageAnimation';
import RtEditor from '@/components/RtEditor';
import msg from '@/utils/msg';

export interface Props extends ReduxProps, RouteProps, FormProps {
  data: IList<ITopic>;
  session: ISessionStatus;
}

interface State {
}

class TopicList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  handlePageChange = page => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  handleTableChange = (e) => {
    console.log(e);
  };

  handleSubmit = () => {
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const v = {
          ...values,
          title: values.topicTitle,
          content: values.content.toHTML(),
        };
        delete v.topicTitle;
        dispatch({
          type: 'topics/addTopic',
          payload: {
            data: v,
          },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            dispatch({
              type: 'topics/setListExpired',
            });
            form.setFieldsValue({
              content: RtEditor.genEmptyContent(),
            });
            router.push(urlf(pages.topics.detail, { param: { id: ret.data.topicId } }))
          }
        });
      }
    });
  };

  render() {
    const {
      loading, data: { page, count, rows }, session, location: { query }, form,
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <PageAnimation>
        <Row gutter={16}>
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="topicId"
                loading={loading}
                onChange={this.handleTableChange}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="Topic"
                  key="Title"
                  render={(text, record: ITopic) => (
                    <Link to={urlf(pages.topics.detail, { param: { id: record.topicId } })}>{record.title}</Link>
                  )}
                />
                {!query.problemId && <Table.Column
                  title="Problem"
                  key="Problem"
                  render={(text, record: ITopic) => (
                    <ProblemBar problem={record.problem} />
                  )}
                />}
                <Table.Column
                  title="Author"
                  key="Author"
                  render={(text, record: ITopic) => (
                    <UserBar user={record.user} />
                  )}
                />
                <Table.Column
                  title="Re."
                  key="Replies"
                  render={(text, record: ITopic) => (
                    record.replyCount
                  )}
                />
                <Table.Column
                  title="At"
                  key="Time"
                  render={(text, record: ITopic) => (
                    <TimeBar time={record.createdAt * 1000} />
                  )}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.topics.list}
                onChange={this.handlePageChange}
              />
            </Card>

            <Card bordered={false}>
              <Form layout="vertical" hideRequiredMark={true}>
                {query.problemId ? <Form.Item label="Problem">
                  {getFieldDecorator('problemId', { initialValue: +query.problemId })(<span
                    className="ant-form-text">{query.problemId}</span>)}
                </Form.Item> : null}

                <Form.Item label="Title">
                  {getFieldDecorator('topicTitle', {
                    rules: [{ required: true, message: 'Please input title' }],
                  })(<Input disabled={!session.loggedIn} />)}
                </Form.Item>

                <Form.Item label="Content">
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
              <Button type="primary" onClick={this.handleSubmit} disabled={!session.loggedIn}>{session.loggedIn ? 'Post' : 'Login to Post'}</Button>
            </Card>
          </Col>

          <Col xs={24} md={6} xxl={4}>
            {/*<Card bordered={false}>*/}
            {/*  {!session.loggedIn*/}
            {/*    ? <Button type="primary" block disabled>登录后发帖</Button>*/}
            {/*    : <CreateTopicModal*/}
            {/*      type={query.type === 'solution' ? 'solution' : 'topic'}*/}
            {/*      problemId={query.problemId}*/}
            {/*      location={location}*/}
            {/*    >*/}
            {/*      <Button type="primary" block>{query.type === 'solution' ? '发表题解' : '发帖'}</Button>*/}
            {/*    </CreateTopicModal>}*/}
            {/*</Card>*/}
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Title', fieldName: 'title' },
                ]}
                initQuery={{ type: query.type, problemId: query.problemId }}
              />
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['topics/getList'],
    data: state.topics.list,
    session: state.session,
  };
}

export default connect(mapStateToProps)(Form.create()(TopicList));
