import React from 'react';
import { Divider, Button, Row, Col, Card } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import { ReduxProps, RouteProps } from '@/@types/props';
import { filterXSS as xss } from 'xss';
import PageAnimation from '@/components/PageAnimation';
import PageTitle from '@/components/PageTitle';
import NotFound from '@/pages/404';
import {
  ICompetition,
  ICompetitionSelfParticipant,
  ICompetitionSelfParticipantForm,
  ICompetitionSettings,
} from '@/common/interfaces/competition';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import msg from '@/utils/msg';
import moment from 'moment';
import { ECompetitionUserStatus } from '@/common/enums';
import { Codes } from '@/common/codes';
// import SdutpcLogo from '../../../assets/images/sdutpc_logo_shadow.png';
import GeneralFormModal from '@/components/GeneralFormModal';
import tracker from '@/utils/tracker';
import Link from 'umi/link';
import { urlf, toLongTs } from '@/utils/format';
import classNames from 'classnames';
import getSetTimeStatus from '@/utils/getSetTimeStatus';
import TimeStatusBadge from '@/components/TimeStatusBadge';
import PageLoading from '@/components/PageLoading';

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

function getInitialState() {
  return {
    selfParticipant: undefined,
    cannotSignUpTips: '',
  };
}

export interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ISessionStatus;
  detail: ICompetition;
  settings: ICompetitionSettings;
}

interface State {
  selfParticipant?: ICompetitionSelfParticipant;
  cannotSignUpTips: string;
}

class CompetitionIntro extends React.Component<Props, State> {
  private _preTheme: string;

  constructor(props) {
    super(props);
    this.state = getInitialState();
    this._preTheme = props.theme;
  }

  componentDidMount() {
    // TODO force dark for some themes
    // this.props.dispatch({
    //   type: 'settings/setTheme',
    //   payload: { theme: 'dark' },
    // });
    if (this.props.session.loggedIn) {
      this.fetch(this.props.id, this.props.dispatch);
    }
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if ((np.session.loggedIn && !p.session.loggedIn) || (np.id !== p.id && np.id)) {
      this.fetch(np.id, np.dispatch);
    }
    if (!np.session.loggedIn) {
      this.setState(getInitialState());
    }
  }

  componentWillUnmount() {
    // this.props.dispatch({
    //   type: 'settings/setTheme',
    //   payload: { theme: this._preTheme },
    // });
  }

  async fetch(competitionId: number, dispatch) {
    const ret = await dispatch({
      type: 'competitions/getSignedUpCompetitionParticipant',
      payload: {
        id: competitionId,
      },
    });
    if (ret.success) {
      this.setState({
        selfParticipant: ret.data,
        cannotSignUpTips: '',
      });
    } else {
      if (ret.code === Codes.COMPETITION_ALREADY_BEEN_A_USER) {
        this.setState({
          selfParticipant: null,
          cannotSignUpTips: 'Cannot sign up: you have already been a non-participant user',
        });
      } else {
        this.setState({
          selfParticipant: null,
          cannotSignUpTips: 'Cannot sign up: unknown error',
        });
      }
    }
  }

  getSelfParticipantFormItems = (data?: ICompetitionSelfParticipantForm) => {
    return [
      {
        name: 'Nickname (VERY IMPORTANT)',
        field: 'nickname',
        placeholder: '起个有意思的昵称，将会在比赛和颁奖仪式展示',
        component: 'input',
        initialValue: data?.info?.nickname || '',
        rules: [
          { required: true, message: 'Please input nickname' },
          { max: 10, message: 'Nickname cannot be longer than 10 characters' },
        ],
      },
      // {
      //   name: 'Unofficial Participation',
      //   field: 'unofficial',
      //   component: 'select',
      //   initialValue: String(data?.unofficialParticipation || false),
      //   options: [
      //     { name: 'Yes', value: true },
      //     { name: 'No', value: false },
      //   ],
      // },
      {
        name: 'Real Name',
        field: 'realName',
        component: 'input',
        initialValue: data?.info?.realName || '',
        rules: [{ required: true, message: 'Please input real name' }],
      },
      {
        name: 'Student Number',
        field: 'studentNo',
        placeholder: 'e.g., 21110501000',
        component: 'input',
        initialValue: data?.info?.studentNo || '',
        rules: [{ required: true, message: 'Please input Student Number' }],
      },
      {
        name: 'School',
        field: 'school',
        placeholder: 'e.g., 山东理工大学',
        component: 'input',
        initialValue: data?.info?.school || '',
        rules: [{ required: true, message: 'Please input school' }],
      },
      // {
      //   name: 'College',
      //   field: 'college',
      //   component: 'input',
      //   initialValue: data?.info?.college || '',
      // },
      // {
      //   name: 'Major',
      //   field: 'major',
      //   component: 'input',
      //   initialValue: data?.info?.major || '',
      // },
      {
        name: 'Class',
        field: 'class',
        placeholder: 'e.g., 计科2101',
        component: 'input',
        initialValue: data?.info?.class || '',
        rules: [{ required: true, message: 'Please input class' }],
      },
      {
        name: 'Tel',
        field: 'tel',
        placeholder: 'e.g., 13512345678',
        component: 'input',
        initialValue: data?.info?.tel || '',
      },
      {
        name: 'QQ',
        field: 'qq',
        component: 'input',
        initialValue: data?.info?.qq || '',
      },
      {
        name: 'Clothing Size',
        field: 'clothing',
        component: 'select',
        initialValue: data?.info?.clothing || '',
        options: CLOTHING_SIZES.map((item) => ({
          value: item,
          name: item,
        })),
      },
      {
        name: 'Slogan (optional)',
        field: 'slogan',
        placeholder: '起个响亮的参赛宣言',
        component: 'input',
        initialValue: data?.info?.slogan || '',
      },
    ];
  };

  inSignUpRange = () => {
    const registerStartAt = new Date(this.props.detail.registerStartAt);
    const registerEndAt = new Date(this.props.detail.registerEndAt);
    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    return registerStartAt.getTime() <= serverTime && serverTime < registerEndAt.getTime();
  };

  isSignUpEnded = () => {
    const registerEndAt = new Date(this.props.detail.registerEndAt);
    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    return serverTime >= registerEndAt.getTime();
  };

  getSignUpStatus = () => {
    const { selfParticipant } = this.state;
    if (!selfParticipant) {
      return null;
    }
    const { status } = selfParticipant;
    switch (status) {
      case ECompetitionUserStatus.auditing:
        return {
          text: 'Under Auditing',
        };
      case ECompetitionUserStatus.modificationRequired:
        return {
          text: 'Modification Required',
          level: 'warning',
        };
      case ECompetitionUserStatus.rejected:
        return {
          text: 'Rejected',
          level: 'danger',
        };
      case ECompetitionUserStatus.available:
      case ECompetitionUserStatus.entered:
      case ECompetitionUserStatus.quitted:
        return {
          text: 'Accepted',
          level: 'success',
        };
    }
    return {
      text: 'Unknown Status',
    };
  };

  enterCompetition = () => {
    router.push(urlf(pages.competitions.home, { param: { id: this.props.id } }));
  };

  renderSignUpStatus = () => {
    const { text, level } = this.getSignUpStatus();
    const words = text.split(' ');
    return (
      <span className={`text-uppercase text-${level}`}>
        {words.map((word, index) => {
          const firstLetter = word.substr(0, 1);
          const remainingLetters = word.substr(1);
          return (
            <span key={`competition-status-word-${word}`}>
              {index > 0 ? ' ' : ''}
              <span className="text-uppercase-bigger-first">{firstLetter}</span>
              {remainingLetters}
            </span>
          );
        })}
      </span>
    );
  };

  renderSignUpAction = () => {
    const { id, session } = this.props;
    const { selfParticipant, cannotSignUpTips } = this.state;
    if (this.isSignUpEnded()) {
      return <Button disabled>Signing Up: Ended</Button>;
    }
    if (!this.inSignUpRange()) {
      return <Button disabled>Not in Progress</Button>;
    }
    if (!session.loggedIn) {
      return <Button disabled>Login to Sign Up</Button>;
    }
    if (!selfParticipant) {
      if (cannotSignUpTips) {
        return <p className="text-secondary">{cannotSignUpTips}</p>;
      }
      return (
        <GeneralFormModal
          loadingEffect="competitions/signUpCompetitionParticipant"
          title="Sign Up"
          autoMsg
          items={this.getSelfParticipantFormItems()}
          submit={(dispatch: ReduxProps['dispatch'], values) => {
            const data = {
              competitionId: id,
              unofficialParticipation: false,
              info: { ...values },
            };
            return dispatch({
              type: 'competitions/signUpCompetitionParticipant',
              payload: {
                id: this.props.id,
                data,
              },
            });
          }}
          onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
            msg.success('Sign up successfully');
            tracker.event({
              category: 'competitions',
              action: 'signUpCompetitionParticipant',
            });
          }}
          onSuccessModalClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
            this.fetch(id, dispatch);
          }}
        >
          <Button type="primary">Sign Up Now</Button>
        </GeneralFormModal>
      );
    }
    const { status } = selfParticipant;
    switch (status) {
      case ECompetitionUserStatus.rejected:
      case ECompetitionUserStatus.entered:
      case ECompetitionUserStatus.quitted:
        return null;
      default:
        return (
          <GeneralFormModal
            loadingEffect="competitions/modifySignedUpCompetitionParticipant"
            title="View/Edit Info"
            autoMsg
            items={this.getSelfParticipantFormItems(selfParticipant)}
            submit={(dispatch: ReduxProps['dispatch'], values) => {
              const data = {
                competitionId: id,
                unofficialParticipation: false,
                info: { ...values },
              };
              return dispatch({
                type: 'competitions/modifySignedUpCompetitionParticipant',
                payload: {
                  id: this.props.id,
                  data,
                },
              });
            }}
            onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
              msg.success('Update successfully');
              tracker.event({
                category: 'competitions',
                action: 'modifySignedUpCompetitionParticipant',
              });
            }}
            onSuccessModalClosed={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
              this.fetch(id, dispatch);
            }}
          >
            <Button type="primary">View/Update Info</Button>
          </GeneralFormModal>
        );
    }
  };

  renderSignUpArea = (detail: ICompetition) => {
    const { selfParticipant } = this.state;
    return (
      <div className="competition-sign-up text-center">
        <h3>Sign Up</h3>
        <div>
          Time range to sign up:{' '}
          <span className="nowrap">
            {detail.registerStartAt && detail.registerEndAt
              ? `${moment(detail.registerStartAt).format('YYYY-MM-DD HH:mm:ss')} ~ ${moment(
                  detail.registerEndAt,
                ).format('YYYY-MM-DD HH:mm:ss')}`
              : 'Not Set'}
          </span>
        </div>

        {selfParticipant && (
          <div style={{ marginTop: '30px' }}>
            <p>Current Status</p>
            <div className="competition-sign-up-status">{this.renderSignUpStatus()}</div>
          </div>
        )}
        <div style={{ marginTop: '30px' }}>{this.renderSignUpAction()}</div>
      </div>
    );
  };

  render() {
    const { loading, detail, settings, id, session } = this.props;
    if (loading) {
      return <PageLoading />;
    }
    if (!detail?.competitionId || !settings) {
      return <NotFound />;
    }

    const currentTime = Date.now() - ((window as any)._t_diff || 0);
    const startTime = toLongTs(detail.startAt);
    const endTime = toLongTs(detail.endAt);
    const timeStatus = getSetTimeStatus(startTime, endTime, currentTime);
    const allowSessionLoginOnly =
      settings.allowedAuthMethods.includes('session') && settings.allowedAuthMethods.length === 1;
    // near start time 2h
    const nearStartTime = startTime - currentTime < 2 * 60 * 60 * 1000;

    return (
      <PageAnimation>
        <PageTitle title={detail.title} loading={loading}>
          <div className={classNames('competition-intro', { 'competition-theme-sdutpc': false })}>
            {/* <div className="competition-logo">
              <img src={SdutpcLogo} alt="SDUTPC" />
            </div> */}

            <Row gutter={16} className="content-view">
              <Col xs={24}>
                <Card bordered={false} style={{ paddingBottom: '16px' }}>
                  <h2 className="text-center">{detail.title}</h2>
                  <p className="text-center" style={{ marginBottom: '5px' }}>
                    <span>
                      {moment(startTime).format('YYYY-MM-DD HH:mm')} ~{' '}
                      {moment(endTime).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </p>
                  <p className="text-center">
                    <TimeStatusBadge start={startTime} end={endTime} cur={currentTime} />
                  </p>
                  {nearStartTime && (
                    <p className="text-center mt-lg">
                      {!session.loggedIn && allowSessionLoginOnly ? (
                        <Button type="primary" disabled>
                          Login OJ first to Enter Competition
                        </Button>
                      ) : (
                        <Button type="primary" onClick={this.enterCompetition}>
                          Enter Competition
                        </Button>
                      )}
                    </p>
                  )}
                </Card>
              </Col>
            </Row>

            <div className="competition-intro-content content-view">
              {/* <h2 className="competition-intro-header">{detail.title}</h2> */}
              <div
                dangerouslySetInnerHTML={{ __html: xss(detail.introduction) }}
                className="content-area"
                style={{ marginTop: '48px' }}
              />
              <Divider style={{ margin: '16px 0' }} />
              {/* sign up area */}
              {settings.allowedJoinMethods.includes('register') && this.renderSignUpArea(detail)}
              <div className="text-center mt-md-lg">
                <Link to={urlf(pages.competitions.public.participants, { param: { id } })}>
                  <Button>👉 View Participants</Button>
                </Link>
              </div>
            </div>
          </div>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.public.intro);
  const detail = state.competitions.detail[id] || ({} as ICompetition);
  const settings = state.competitions.settings[id] || ({} as ICompetitionSettings);
  const theme = state.settings.theme;
  return {
    id,
    session: state.session,
    loading:
      !!state.loading.effects['competitions/getDetail'] ||
      !!state.loading.effects['competitions/getSettings'],
    detail,
    settings,
    theme,
  };
}

export default connect(mapStateToProps)(CompetitionIntro);
