import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Avatar, Tabs, List, Icon, Skeleton, Upload, Button } from 'antd';
import { Link } from 'react-router-dom';
import styles from './$id.less';
import { formatAvatarUrl, urlf } from '@/utils/format';
import pages from '@/configs/pages';
import moment from 'moment';
import xss from 'xss';
import { Results } from '@/configs/results';
import NotFound from '@/pages/404';
import constants from '@/configs/constants';
import msg from '@/utils/msg';
import { isSelf } from '@/utils/permission';
import api from '@/configs/apis';
import classNames from 'classnames';
import loadImage from 'image-promise';
import SolutionCalendar from '@/components/SolutionCalendar';
import Rating from '@/components/Rating';

interface UploadFileType {
  name: string;
  type: string;
}

function validateFile(validTypes: UploadFileType[], maxSize: number) {
  return function (file) {
    const isValidType = validTypes.filter(v => v.type === file.type).length > 0;
    if (!isValidType) {
      msg.error(`Invalid file format. Only ${validTypes.map(v => v.name).join(', ')} allowed`);
    }
    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      msg.error(`File must be smaller than ${maxSize} MiB`);
    }
    return isValidType && isValidSize;
  }
}

interface Props extends RouteProps, ReduxProps {
  data: TypeObject<IUser>;
  session: ISessionStatus;
}

interface State {
  uploadAvatarLoading: boolean;
  uploadBannerImageLoading: boolean;
  bannerImageLoading: boolean;
  bannerImageUrl: string;
}

class UserDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      uploadAvatarLoading: false,
      uploadBannerImageLoading: false,
      bannerImageLoading: false,
      bannerImageUrl: '',
    };
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

  checkBannerImage = (props: Props) => {
    const { data: allData, match } = props;
    const id = ~~match.params.id;
    const data = allData[id] || {} as IUser;
    if (!data.bannerImage) {
      return;
    }
    const thumbUrl = `${constants.bannerImageUrlPrefix}xs_${data.bannerImage}`;
    const fullUrl = `${constants.bannerImageUrlPrefix}${data.bannerImage}`;
    this.setState({
      bannerImageLoading: true,
      bannerImageUrl: thumbUrl,
    });
    loadImage(fullUrl).then(() => {
      try {
        setTimeout(() => {
          this.setState({
            bannerImageLoading: false,
            bannerImageUrl: fullUrl,
          });
        }, 2000);
      }
      catch (err) {
        console.error(err);
      }
    }).catch(err => {
      console.error(err);
      this && this.setState && this.setState({
        bannerImageLoading: false,
        bannerImageUrl: fullUrl,
      });
    });
  };

  componentDidMount(): void {
    window.scrollTo(0, 0);
    this.checkBannerImage(this.props);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    const oldId = ~~this.props.match.params.id;
    const newId = ~~nextProps.match.params.id;
    let oldBannerImage = '';
    let newBannerImage = '';
    try {
      oldBannerImage = this.props.data[oldId].bannerImage;
    }
    catch (e) {}
    try {
      newBannerImage = nextProps.data[newId].bannerImage;
    }
    catch (e) {}
    if (oldBannerImage !== newBannerImage) {
      this.checkBannerImage(nextProps);
    }
  }

  validateAvatar = validateFile([
      { name: 'JPG', type: 'image/jpeg' },
      { name: 'BMP', type: 'image/bmp' },
      { name: 'PNG', type: 'image/png' },
    ], 4
  );

  handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadAvatarLoading: true });
    }
    else if (info.file.status === 'done') {
      const resp = info.file.response;
      msg.auto(resp);
      if (resp.success) {
        this.props.dispatch({
          type: 'users/getDetail',
          payload: {
            id: ~~this.props.match.params.id,
            force: true,
          },
        });
        this.props.dispatch({
          type: 'session/fetch',
        });
      }
      this.setState({ uploadAvatarLoading: false });
    }
  };

  validateBannerImage = validateFile([
      { name: 'JPG', type: 'image/jpeg' },
      { name: 'BMP', type: 'image/bmp' },
      { name: 'PNG', type: 'image/png' },
    ], 12
  );

  handleBannerImageChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadBannerImageLoading: true });
    }
    else if (info.file.status === 'done') {
      const resp = info.file.response;
      msg.auto(resp);
      if (resp.success) {
        this.props.dispatch({
          type: 'users/getDetail',
          payload: {
            id: ~~this.props.match.params.id,
            force: true,
          },
        });
      }
      this.setState({ uploadBannerImageLoading: false });
    }
  };

  render() {
    const { loading, data: allData, session, match } = this.props;
    const { uploadAvatarLoading, uploadBannerImageLoading, bannerImageLoading, bannerImageUrl } = this.state;
    const id = ~~match.params.id;
    const notFound = !loading && !allData[id];
    if (notFound) {
      return <NotFound />;
    }
    const data = allData[id] || {} as IUser;
    const self = isSelf(session, data.userId);
    return (
      <div>
        <div className={classNames('u-bbg', { thumb: bannerImageLoading, 'no-banner': !data.bannerImage })} style={{
          backgroundImage: data.bannerImage ? `url(${bannerImageUrl})` : undefined,
        }} />
        {self &&
        <div className="banner-edit-btn">
          <Upload name="bannerImage"
                  action={urlf(`${api.base}${api.users.bannerImage}`, { param: { id } })}
                  beforeUpload={this.validateBannerImage}
                  onChange={this.handleBannerImageChange}
                  showUploadList={false}
          >
            <Button ghost loading={uploadBannerImageLoading}>Change Banner</Button>
          </Upload>
        </div>}
        <div className="content-view" style={{ position: 'relative' }}>
          <div className="u-header" style={{ height: '60px' }}>
            <span className="u-avatar">
              {!self ?
                <Avatar size={120} icon="user" src={formatAvatarUrl(data.avatar)} /> :
                <Upload name="avatar"
                        className={classNames('upload-mask', { hold: uploadAvatarLoading || loading })}
                        action={urlf(`${api.base}${api.users.avatar}`, { param: { id } })}
                        beforeUpload={this.validateAvatar}
                        onChange={this.handleAvatarChange}
                        showUploadList={false}
                >
                  {uploadAvatarLoading || loading ?
                    <Icon type="loading" className="upload-mask-icon" /> :
                    <Icon type="upload" className="upload-mask-icon" />
                  }
                  <Avatar size={120} icon="user" src={formatAvatarUrl(data.avatar)} />
                </Upload>
              }
            </span>
            <span className="u-info">
              <h1>{data.nickname}</h1>
            </span>
          </div>

          <div className="u-content">
            <Row gutter={16}>
              <Col xs={24} md={18} xxl={18}>
                <Card bordered={false}>
                  <h3>Rating</h3>
                  <Rating rating={data.rating} ratingHistory={data.ratingHistory || []} loading={loading} />
                </Card>

                <Card bordered={false}>
                  <h3>AC Calendar</h3>
                  <SolutionCalendar data={data.solutionCalendar} />
                </Card>

                <Card bordered={false}>
                  <h3 className="warning-text">╮(￣▽￣)╭<br />未开放测试的功能</h3>
                </Card>

                {/*<Card bordered={false}>*/}
                  {/*<h3>Activities</h3>*/}
                  {/*<Tabs defaultActiveKey="1">*/}
                    {/*<Tabs.TabPane tab="Shared (3)" key="1">{this.listComponent}</Tabs.TabPane>*/}
                    {/*<Tabs.TabPane tab="Asked (2)" key="2">Content of Tab Pane 2</Tabs.TabPane>*/}
                    {/*<Tabs.TabPane tab="Answered (15)" key="3">Content of Tab Pane 3</Tabs.TabPane>*/}
                  {/*</Tabs>*/}
                {/*</Card>*/}
              </Col>
              <Col xs={24} md={6} xxl={6}>
                <Card bordered={false}>
                  <div style={{ width: '100%' }}>
                    <Link to={urlf(pages.solutions.index, { query: { userId: data.userId, result: Results.AC } })} className="normal-text-link">
                      <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center' }}>
                        <p style={{ marginBottom: '4px', fontSize: '16px', height: '25px' }}><strong>{data.accepted}</strong></p>
                        <p style={{ fontSize: '12px' }}>AC</p>
                      </div>
                    </Link>
                    <Link to={urlf(pages.solutions.index, { query: { userId: data.userId } })} className="normal-text-link">
                      <div style={{ display: 'block', width: '50%', float: 'left', textAlign: 'center' }} className="card-block-divider">
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

