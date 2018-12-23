import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Avatar, Tabs, List, Icon, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import styles from './$id.less';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import moment from 'moment';
import xss from 'xss';
import { Results } from '@/configs/results';
import NotFound from '@/pages/404';
import constants from '@/configs/constants';

interface Props extends RouteProps, ReduxProps {
  data: TypeObject<IUser>;
  session: ISession;
}

interface State {
}

class UserDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  list = [
    { id: 1, title: '关于商人小鑫的另一种解法', time: 1539838234 },
    { id: 2, title: 'STL 大全', time: 1539333234 },
    { id: 3, title: '时间格式转换题解', time: 1539233234 },
  ];

  listComponent = (
    <List
      itemLayout="horizontal"
      size="small"
      // loadMore={() => console.log('more')}
      dataSource={this.list.slice(0, 3)}
      renderItem={item => (
        <List.Item>
          <List.Item.Meta
            title={<a>{item.title}</a>}
            description={moment(item.time * 1000).fromNow()}
          />
        </List.Item>
      )}
    />
  );

  render() {
    const { loading, data: allData, match } = this.props;
    const id = ~~match.params.id;
    const notFound = !loading && !allData[id];
    if (notFound) {
      return <NotFound />;
    }
    const data = allData[id] || {} as IUser;
    return (
      <div>
        <div className="u-bbg"></div>
        <div className="content-view" style={{ position: 'relative' }}>
          <div className="u-header" style={{ height: '60px' }}>
            <span className="u-avatar">
              <Avatar size={120} icon="user" src={data.avatar && `${constants.avatarUrlPrefix}${data.avatar}`} />
            </span>
            <span className="u-info">
              <h1>{data.nickname}</h1>
            </span>
          </div>

          <div className="u-content">
            <Row gutter={16}>
              <Col xs={24} md={18} xxl={20}>
                {/*<Card bordered={false}>*/}
                  {/*<h3>Rating</h3>*/}
                  {/*<img src="http://127.0.0.1/oj3_bgs/rating3.png" style={{ maxWidth: '100%' }} />*/}
                {/*</Card>*/}

                {/*<Card bordered={false}>*/}
                  {/*<h3>AC Calendar</h3>*/}
                  {/*<img src="http://127.0.0.1/oj3_bgs/ac-cal.png" style={{ maxWidth: '100%' }} />*/}
                {/*</Card>*/}

                <Card bordered={false}>
                  <h3>Activities</h3>
                  <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Shared (3)" key="1">{this.listComponent}</Tabs.TabPane>
                    <Tabs.TabPane tab="Asked (2)" key="2">Content of Tab Pane 2</Tabs.TabPane>
                    <Tabs.TabPane tab="Answered (15)" key="3">Content of Tab Pane 3</Tabs.TabPane>
                  </Tabs>
                </Card>
              </Col>
              <Col xs={24} md={6} xxl={4}>
                <Card bordered={false}>
                  <div style={{ width: '100%' }}>
                    <Link to={urlf(pages.solutions.index, { query: { userId: data.userId, result: Results.AC } })} className="normal-text-link">
                      <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center' }}>
                        <p style={{ marginBottom: '4px', fontSize: '16px', height: '25px' }}><strong>{data.accepted}</strong></p>
                        <p style={{ fontSize: '12px' }}>AC</p>
                      </div>
                    </Link>
                    <Link to={urlf(pages.solutions.index, { query: { userId: data.userId } })} className="normal-text-link">
                      <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center', borderLeft: '1px solid #ddd' }}>
                        <p style={{ marginBottom: '4px', fontSize: '16px', height: '25px' }}><strong>{data.submitted}</strong></p>
                        <p style={{ fontSize: '12px' }}>Total</p>
                      </div>
                    </Link>
                  </div>
                </Card>
                <Card bordered={false} className={styles.infoBoard}>
                  <Skeleton active loading={loading} paragraph={{ rows: 5, width: '100%' }}>
                    <table>
                      <tbody>
                      <tr>
                        <td>School</td>
                        <td>{xss(data.school)}</td>
                      </tr>
                      <tr>
                        <td>College</td>
                        <td>{xss(data.college)}</td>
                      </tr>
                      <tr>
                        <td>Major</td>
                        <td>{xss(data.major)}</td>
                      </tr>
                      <tr>
                        <td>Class</td>
                        <td>{xss(data.class)}</td>
                      </tr>
                      {data.site ?
                      <tr>
                        <td>Site</td>
                        <td><a href={xss(data.site)} target="_blank">{xss(data.site)}</a></td>
                      </tr> : null}
                      </tbody>
                    </table>
                  </Skeleton>
                </Card>

                {/*<Card bordered={false}>*/}
                  {/*<Icon type="like" theme="outlined" className="mr-sm" /> Collected <strong>3</strong> likes*/}
                {/*</Card>*/}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['users/getDetail'],
    data: state.users.detail,
    session: state.session,
  };
}

export default connect(mapStateToProps)(UserDetail);

