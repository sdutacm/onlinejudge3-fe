import React from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Spin, Divider } from 'antd';
import Link from 'umi/link';
import NavContainer from './components/NavContainer';
import pages from '../configs/pages';
import constants from '../configs/constants';
import gStyles from '../general.less';
import styles from './index.less';
import { ReduxProps, RouteProps } from '@/@types/props';
import moment from 'moment';
import { matchPath } from 'react-router';

interface Props extends ReduxProps, RouteProps {
}

interface State {
  sessionLoaded: boolean;
}

class Index extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      sessionLoaded: false,
    };
  }

  fetchSession = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'session/fetch' }).then(function () {
      this.setState({ sessionLoaded: true });
    }.bind(this));
  };

  componentDidMount() {
    this.fetchSession();
  }

  render() {
    const { children, location } = this.props;
    const { Header, Content, Footer } = Layout;
    const inUserDetailPage = matchPath(location.pathname, {
      path: pages.users.detail,
      exact: true,
    });
    return (
      <Layout className={inUserDetailPage ? 'user-page' : ''}>
        <Header>
          <Row>
            <Col>
              <Link to="/" className={styles.logo}>{constants.siteName}</Link>
            </Col>
            <Col>
              <NavContainer />
            </Col>
          </Row>
        </Header>
        <Content>
          {this.state.sessionLoaded ? children :
            <Spin delay={constants.indicatorDisplayDelay} className={gStyles.spin} />}
        </Content>
        <Footer className={styles.footer}>
          <p>© 2008-{moment().format('YYYY')} SDUTACM Team. All Rights Reserved.</p>
          <div>
            <a>API</a>
            <Divider type="vertical" />
            <a>Feedback</a>
            <Divider type="vertical" />
            <a>About Us</a>
          </div>
        </Footer>
      </Layout>
    );
  }
}

export default connect()(Index);
