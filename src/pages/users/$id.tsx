import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { Row, Col, Card, Avatar, Icon, Skeleton, Upload, Button, Select } from 'antd';
import { Link } from 'react-router-dom';
import styles from './$id.less';
import { formatAvatarUrl, urlf } from '@/utils/format';
import pages from '@/configs/pages';
import { filterXSS as xss } from 'xss';
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
import SendMessageModal from '@/components/SendMessageModal';
import PageTitle from '@/components/PageTitle';
import PageAnimation from '@/components/PageAnimation';
import { validateFile } from '@/utils/validate';
import GeneralFormModal from '@/components/GeneralFormModal';
import langs from '@/configs/solutionLanguages';
import ChangeEmailModal from '@/components/ChangeEmailModal';
import tracker from '@/utils/tracker';
import { routesBe } from '@/common/routes';
import { getCsrfHeader } from '@/utils/misc';
import ManageSessionModal from '@/components/ManageSessionModal';

export interface Props extends RouteProps, ReduxProps {
  data: ITypeObject<IUser>;
  session: ISessionStatus;
}

interface State {
  uploadAvatarLoading: boolean;
  uploadBannerImageLoading: boolean;
  bannerImageLoading: boolean;
  bannerImageUrl: string;
  solutionCalendarPeriod: number | null;
}

class UserDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  private validateAvatar = validateFile(
    [
      { name: 'JPG', type: 'image/jpeg' },
      { name: 'BMP', type: 'image/bmp' },
      { name: 'PNG', type: 'image/png' },
    ],
    4,
  );
  private validateBannerImage = validateFile(
    [
      { name: 'JPG', type: 'image/jpeg' },
      { name: 'BMP', type: 'image/bmp' },
      { name: 'PNG', type: 'image/png' },
    ],
    12,
  );

  constructor(props) {
    super(props);
    this.state = {
      uploadAvatarLoading: false,
      uploadBannerImageLoading: false,
      bannerImageLoading: false,
      bannerImageUrl: '',
      solutionCalendarPeriod: null,
    };
  }

  // list = [
  //   { id: 1, title: '关于商人小鑫的另一种解法', time: 1539838234 },
  //   { id: 2, title: 'STL 大全', time: 1539333234 },
  //   { id: 3, title: '时间格式转换题解', time: 1539233234 },
  // ];
  //
  // listComponent = (
  //   <List
  //     itemLayout="horizontal"
  //     size="small"
  //     // loadMore={() => console.log('more')}
  //     dataSource={this.list.slice(0, 3)}
  //     renderItem={item => (
  //       <List.Item>
  //         <List.Item.Meta
  //           title={<a>{item.title}</a>}
  //           description={moment(item.time * 1000).fromNow()}
  //         />
  //       </List.Item>
  //     )}
  //   />
  // );

  checkBannerImage = async (props: Props) => {
    const { data: allData, match } = props;
    const id = ~~match.params.id;
    const data = allData[id] || ({} as IUser);
    if (!data.bannerImage) {
      return;
    }
    const imageExtIndex = data.bannerImage.lastIndexOf('.');
    const ext = data.bannerImage.substring(imageExtIndex + 1) || 'jpg';
    const thumbUrl = `${constants.bannerImageUrlPrefix}min_${data.bannerImage.substring(
      0,
      imageExtIndex,
    )}.${ext}`;
    const fullUrl = `${constants.bannerImageUrlPrefix}${data.bannerImage}`;
    // 设置缩略图
    try {
      const _thumbStart = Date.now();
      await loadImage(thumbUrl);
      const thumbCost = Date.now() - _thumbStart;
      thumbCost > 120 &&
        tracker.timing({
          category: 'users',
          variable: 'downloadThumbBanner',
          value: thumbCost,
        });
    } catch (err) {
      console.error(err);
    } finally {
      this.setState({
        bannerImageLoading: true,
        bannerImageUrl: thumbUrl,
      });
    }
    // 设置全尺寸图
    try {
      const _fullStart = Date.now();
      await loadImage(fullUrl);
      const fullCost = Date.now() - _fullStart;
      fullCost > 120 &&
        tracker.timing({
          category: 'users',
          variable: 'downloadFullBanner',
          value: fullCost,
        });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        this.setState({
          bannerImageLoading: false,
          bannerImageUrl: fullUrl,
        });
      }, 100);
    }
  };

  componentDidMount() {
    this.checkBannerImage(this.props);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
    const oldId = ~~this.props.match.params.id;
    const newId = ~~nextProps.match.params.id;
    let oldBannerImage = '';
    let newBannerImage = '';
    try {
      oldBannerImage = this.props.data[oldId].bannerImage;
    } catch (e) {}
    try {
      newBannerImage = nextProps.data[newId].bannerImage;
    } catch (e) {}
    if (oldBannerImage !== newBannerImage) {
      this.setState(
        {
          bannerImageLoading: false,
          bannerImageUrl: '',
        },
        () => this.checkBannerImage(nextProps),
      );
    }
  }

  handleAvatarChange = (info) => {
    if (info.file.status === 'uploading') {
      if (!this.state.uploadAvatarLoading) {
        tracker.event({
          category: 'users',
          action: 'uploadAvatar',
        });
      }
      this.setState({ uploadAvatarLoading: true });
    } else if (info.file.status === 'done') {
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

  handleBannerImageChange = (info) => {
    if (info.file.status === 'uploading') {
      if (!this.state.uploadBannerImageLoading) {
        tracker.event({
          category: 'users',
          action: 'uploadBanner',
        });
      }
      this.setState({ uploadBannerImageLoading: true });
    } else if (info.file.status === 'done') {
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

  handleSolutionCalendarPeriodChange = (value) => {
    this.setState({ solutionCalendarPeriod: value });
    tracker.event({
      category: 'users',
      action: 'switchSolutionCalendarPeriod',
      label: value,
    });
  };

  changePasswordFormItems = [
    {
      name: 'Old Password',
      field: 'oldPassword',
      component: 'input',
      type: 'password',
      rules: [{ required: true, message: 'Please input old password' }],
    },
    {
      name: 'New Password',
      field: 'password',
      component: 'input',
      type: 'password',
      rules: [{ required: true, message: 'Please input new password' }],
    },
    {
      name: 'Confirm Password',
      field: 'confirmPassword',
      component: 'input',
      type: 'password',
      rules: [{ required: true, message: 'Please confirm new password' }],
    },
  ];

  render() {
    const { loading, data: allData, session, match } = this.props;
    const {
      uploadAvatarLoading,
      uploadBannerImageLoading,
      bannerImageLoading,
      bannerImageUrl,
      solutionCalendarPeriod,
    } = this.state;
    const id = ~~match.params.id;
    const notFound = !loading && !allData[id];
    if (notFound) {
      return <NotFound />;
    }
    const data = allData[id] || ({} as IUser);
    const self = isSelf(session, data.userId);
    const solutionCalendarYears = new Set();
    (data.solutionCalendar || []).forEach((d) => {
      const year = +d.date.split('-')[0];
      solutionCalendarYears.add(year);
    });

    let editProfileFormItems = [
      {
        name: 'School',
        field: 'school',
        component: 'input',
        initialValue: data.school,
        rules: [{ required: true, message: 'Please input school' }],
      },
      {
        name: 'College',
        field: 'college',
        component: 'input',
        initialValue: data.college,
        rules: [{ required: true, message: 'Please input college' }],
      },
      {
        name: 'Major',
        field: 'major',
        component: 'input',
        initialValue: data.major,
        rules: [{ required: true, message: 'Please input major' }],
      },
      {
        name: 'Class',
        field: 'class',
        component: 'input',
        initialValue: data.class,
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Site',
        field: 'site',
        component: 'input',
        initialValue: data.site,
      },
      {
        name: 'Default Language',
        field: 'defaultLanguage',
        component: 'select',
        initialValue: data.defaultLanguage,
        options: langs.map((item) => ({
          value: item.fieldName,
          name: item.displayShortName,
        })),
        rules: [{ required: true, message: 'Please input default language' }],
      },
    ];

    return (
      <PageTitle title={data.nickname} loading={loading}>
        <div>
          <div
            className={classNames('u-bbg', {
              thumb: bannerImageLoading,
              'no-banner': !data.bannerImage,
            })}
            style={{
              backgroundImage: data.bannerImage ? `url(${bannerImageUrl})` : undefined,
            }}
          />
          {self && (
            <div className="banner-edit-btn">
              <Upload
                name="bannerImage"
                accept="image/jpeg,image/bmp,image/png"
                action={`${api.base}${routesBe.uploadUserBannerImage.url}`}
                beforeUpload={this.validateBannerImage}
                onChange={this.handleBannerImageChange}
                showUploadList={false}
                headers={getCsrfHeader()}
              >
                <Button ghost loading={uploadBannerImageLoading}>
                  Change Banner
                </Button>
              </Upload>
            </div>
          )}
          <div className="content-view" style={{ position: 'relative' }}>
            <div className="u-header" style={{ height: '60px' }}>
              <span className="u-avatar">
                {!self ? (
                  <Avatar size={120} icon="user" src={formatAvatarUrl(data.avatar)} />
                ) : (
                  <Upload
                    name="avatar"
                    accept="image/jpeg,image/bmp,image/png"
                    className={classNames('upload-mask', { hold: uploadAvatarLoading || loading })}
                    action={`${api.base}${routesBe.uploadUserAvatar.url}`}
                    beforeUpload={this.validateAvatar}
                    onChange={this.handleAvatarChange}
                    showUploadList={false}
                    headers={getCsrfHeader()}
                  >
                    {uploadAvatarLoading || loading ? (
                      <Icon type="loading" className="upload-mask-icon" />
                    ) : (
                      <Icon type="upload" className="upload-mask-icon" />
                    )}
                    <Avatar size={120} icon="user" src={formatAvatarUrl(data.avatar)} />
                  </Upload>
                )}
              </span>
              <span className="u-info">
                <h1>{data.nickname}</h1>
              </span>
            </div>

            <PageAnimation>
              <div className="u-content">
                <Row gutter={16} className="list-view">
                  <Col xs={24} md={18} xxl={18}>
                    <Card bordered={false}>
                      <h3>Rating</h3>
                      <Rating
                        rating={data.rating}
                        ratingHistory={data.ratingHistory || []}
                        loading={loading}
                      />
                    </Card>

                    <Card bordered={false}>
                      <h3>
                        AC Calendar
                        <Select
                          defaultValue={null}
                          className="float-right"
                          size="small"
                          onChange={this.handleSolutionCalendarPeriodChange}
                        >
                          {(Array.from(solutionCalendarYears) as number[]).map((y) => (
                            <Select.Option key={`${y}`} value={y}>
                              {y}
                            </Select.Option>
                          ))}
                          <Select.Option value={null}>Recent</Select.Option>
                        </Select>
                      </h3>
                      <SolutionCalendar
                        data={data.solutionCalendar}
                        startDate={
                          solutionCalendarPeriod ? `${solutionCalendarPeriod}-01-01` : undefined
                        }
                        endDate={
                          solutionCalendarPeriod ? `${solutionCalendarPeriod}-12-31` : undefined
                        }
                      />
                    </Card>

                    {/* <Card bordered={false}>
                      <h3 className="warning-text">╮(￣▽￣)╭<br />未开放测试的功能</h3>
                    </Card> */}

                    {/* <Card bordered={false}> */}
                    {/* <h3>Activities</h3> */}
                    {/* <Tabs defaultActiveKey="1"> */}
                    {/* <Tabs.TabPane tab="Shared (3)" key="1">{this.listComponent}</Tabs.TabPane> */}
                    {/* <Tabs.TabPane tab="Asked (2)" key="2">Content of Tab Pane 2</Tabs.TabPane> */}
                    {/* <Tabs.TabPane tab="Answered (15)" key="3">Content of Tab Pane 3</Tabs.TabPane> */}
                    {/* </Tabs> */}
                    {/* </Card> */}
                  </Col>
                  <Col xs={24} md={6} xxl={6}>
                    <Card bordered={false}>
                      <div style={{ width: '100%' }}>
                        <Link
                          to={urlf(pages.solutions.index, {
                            query: { userId: data.userId, result: Results.AC },
                          })}
                          className="normal-text-link"
                          onClick={() => {
                            tracker.event({
                              category: 'users',
                              action: 'toSolution',
                              label: 'AC',
                            });
                          }}
                        >
                          <div
                            style={{
                              display: 'block',
                              width: '50%',
                              float: 'left',
                              textAlign: 'center',
                            }}
                          >
                            <p style={{ marginBottom: '4px', fontSize: '16px', height: '25px' }}>
                              <strong>{data.accepted}</strong>
                            </p>
                            <p style={{ fontSize: '12px' }}>AC</p>
                          </div>
                        </Link>
                        <Link
                          to={urlf(pages.solutions.index, { query: { userId: data.userId } })}
                          className="normal-text-link"
                          onClick={() => {
                            tracker.event({
                              category: 'users',
                              action: 'toSolution',
                              label: 'Total',
                            });
                          }}
                        >
                          <div
                            style={{
                              display: 'block',
                              width: '50%',
                              float: 'left',
                              textAlign: 'center',
                            }}
                            className="card-block-divider"
                          >
                            <p style={{ marginBottom: '4px', fontSize: '16px', height: '25px' }}>
                              <strong>{data.submitted}</strong>
                            </p>
                            <p style={{ fontSize: '12px' }}>Submitted</p>
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
                            {data.site ? (
                              <tr>
                                <td>Site</td>
                                <td>
                                  <a
                                    href={xss(data.site)}
                                    target="_blank"
                                    onClick={() => {
                                      tracker.event({
                                        category: 'users',
                                        action: 'toSite',
                                      });
                                    }}
                                  >
                                    {xss(data.site)}
                                  </a>
                                </td>
                              </tr>
                            ) : null}
                            {data.email ? (
                              <tr>
                                <td>Email</td>
                                <td>{xss(data.email)}</td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </Skeleton>
                    </Card>

                    {data.groups?.length > 0 && (
                      <Card bordered={false}>
                        <h4>Groups</h4>
                        {data.groups.map((g) => (
                          <p key={g.groupId} style={{ marginBottom: '0' }}>
                            <Link
                              to={urlf(pages.groups.detail, { param: { id: g.groupId } })}
                              className="normal-text-link display-flex"
                              style={{ fontSize: '12px' }}
                            >
                              <div className="text-ellipsis">{g.name}</div>
                              {g.verified && (
                                <div className="verified-badge ml-sm-md" title="Verified">
                                  V
                                </div>
                              )}
                            </Link>
                          </p>
                        ))}
                      </Card>
                    )}

                    {self && (
                      <Card bordered={false} className={styles.infoBoard}>
                        <GeneralFormModal
                          loadingEffect="users/editProfile"
                          title="Edit Profile"
                          autoMsg
                          items={editProfileFormItems}
                          submit={(dispatch: ReduxProps['dispatch'], values) => {
                            tracker.event({
                              category: 'users',
                              action: 'editProfile',
                            });
                            return dispatch({
                              type: 'users/editProfile',
                              payload: {
                                userId: session.user.userId,
                                data: values,
                              },
                            });
                          }}
                          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                            msg.success('Update successfully');
                          }}
                          onSuccessModalClosed={(
                            dispatch: ReduxProps['dispatch'],
                            ret: IApiResponse<any>,
                          ) => {
                            dispatch({
                              type: 'users/getDetail',
                              payload: {
                                id: session.user.userId,
                                force: true,
                              },
                            });
                          }}
                        >
                          <Button block>Edit Profile</Button>
                        </GeneralFormModal>

                        <ChangeEmailModal
                          type={data.verified ? 'change' : 'bind'}
                          userId={data.userId}
                        >
                          <Button block className="mt-md">
                            {data.verified ? 'Change Email' : 'Bind Email'}
                          </Button>
                        </ChangeEmailModal>

                        <GeneralFormModal
                          loadingEffect="users/changePassword"
                          title="Change Password"
                          autoMsg
                          items={this.changePasswordFormItems}
                          submit={(dispatch: ReduxProps['dispatch'], values) => {
                            if (values.password !== values.confirmPassword) {
                              msg.error('Two passwords are inconsistent');
                              return;
                            } else {
                              tracker.event({
                                category: 'users',
                                action: 'changePassword',
                              });
                              return dispatch({
                                type: 'users/changePassword',
                                payload: {
                                  userId: session.user.userId,
                                  data: {
                                    oldPassword: values.oldPassword,
                                    password: values.password,
                                  },
                                },
                              });
                            }
                          }}
                          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                            msg.success('Update successfully');
                          }}
                        >
                          <Button block className="mt-md">
                            Change Password
                          </Button>
                        </GeneralFormModal>

                        <ManageSessionModal
                          userId={data.userId}
                        >
                          <Button block className="mt-md">
                            Manage Session
                          </Button>
                        </ManageSessionModal>
                      </Card>
                    )}

                    {!loading && session.loggedIn && !isSelf(session, data.userId) && (
                      <Card bordered={false}>
                        <SendMessageModal toUserId={data.userId}>
                          <Button block>Send Message</Button>
                        </SendMessageModal>
                      </Card>
                    )}

                    {/* <Card bordered={false}> */}
                    {/* <Icon type="like" theme="outlined" className="mr-sm" /> Collected <strong>3</strong> likes */}
                    {/* </Card> */}
                  </Col>
                </Row>
              </div>
            </PageAnimation>
          </div>
        </div>
      </PageTitle>
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
