import React from 'react';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Avatar, Tabs, List, Icon } from 'antd';
import styles from '../problems/$id.less';
import urlf from '@/utils/urlf';
import pages from '@/configs/pages';
import moment from 'moment';

interface Props extends RouteProps, ReduxProps {
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
    return (
      <div>
        <div className="u-bbg"></div>
        <div className="content-view" style={{ position: 'relative' }}>
          <div className="u-header">
            <span className="u-avatar">
              <Avatar size={120} icon="user" src="http://127.0.0.1/oj3_bgs/lxh.jpg" />
            </span>
            <span className="u-info">
              <h1>raincloud</h1>
            </span>
          </div>

          <div className="u-content">
            <Row gutter={16}>
              <Col xs={24} md={18} xxl={20}>
                <Card bordered={false}>
                  <h3>Rating</h3>
                  <img src="http://127.0.0.1/oj3_bgs/rating3.png" style={{ maxWidth: '100%' }} />
                </Card>

                <Card bordered={false}>
                  <h3>AC Calendar</h3>
                  <img src="http://127.0.0.1/oj3_bgs/ac-cal.png" style={{ maxWidth: '100%' }} />
                </Card>

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
                    <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center' }}>
                      <p style={{ marginBottom: '4px', fontSize: '16px' }}><strong>237</strong></p>
                      <p style={{ fontSize: '12px' }}>AC</p>
                    </div>
                    <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center', borderLeft: '1px solid #ddd' }}>
                      <p style={{ marginBottom: '4px', fontSize: '16px' }}><strong>1024</strong></p>
                      <p style={{ fontSize: '12px' }}>Total</p>
                    </div>
                  </div>
                </Card>
                <Card bordered={false} className={styles.infoBoard}>
                  <table>
                    <tbody>
                    <tr>
                      <td>School</td>
                      <td>SDUT</td>
                    </tr>
                    <tr>
                      <td>College</td>
                      <td>计算机学院</td>
                    </tr>
                    <tr>
                      <td>Major</td>
                      <td>计算机科学与技术</td>
                    </tr>
                    <tr>
                      <td>Class</td>
                      <td>计科 0000</td>
                    </tr>
                    <tr>
                      <td>Site</td>
                      <td><a>acm.sdut.edu.cn</a></td>
                    </tr>
                    </tbody>
                  </table>
                </Card>

                <Card bordered={false}>
                  <Icon type="like" theme="outlined" className="mr-sm" /> Collected <strong>3</strong> likes
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

export default UserDetail;
