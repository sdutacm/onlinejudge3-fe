import React from 'react';
import { Divider, Button } from 'antd';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import { filterXSS as xss } from 'xss';
import PageAnimation from '@/components/PageAnimation';
import PageTitle from '@/components/PageTitle';
import NotFound from '@/pages/404';
import {
  ICompetition,
  ICompetitionSelfParticipant,
  ICompetitionSelfParticipantForm,
} from '@/common/interfaces/competition';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import msg from '@/utils/msg';
import moment from 'moment';
import { ECompetitionUserStatus } from '@/common/enums';
import { Codes } from '@/common/codes';
import SdutpcLogo from '../../../assets/images/sdutpc_logo_shadow.png';
import GeneralFormModal from '@/components/GeneralFormModal';
import tracker from '@/utils/tracker';

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
  data: ICompetition;
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
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme: 'dark' },
    });
    if (this.props.session.loggedIn) {
      this.fetch(this.props.id, this.props.dispatch);
    }
  }

  componentWillReceiveProps(np: Props) {
    const p = this.props;
    if ((np.session.loggedIn && !p.session.loggedIn) || np.id !== p.id) {
      this.fetch(np.id, np.dispatch);
    }
    if (!np.session.loggedIn) {
      this.setState(getInitialState());
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'settings/setTheme',
      payload: { theme: this._preTheme },
    });
  }

  async fetch(competitionId: number, dispatch) {
    const ret = await dispatch({
      type: 'competitions/getSignedUpCompetitionParticipant',
      payload: {
        id: competitionId,
      },
    });
    msg.auto(ret);
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
        name: 'Nickname',
        field: 'nickname',
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
        name: 'Student No.',
        field: 'studentNo',
        placeholder: 'e.g., 21110501000',
        component: 'input',
        initialValue: data?.info?.studentNo || '',
        rules: [{ required: true, message: 'Please input Student No.' }],
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
        name: 'Slogan',
        field: 'slogan',
        component: 'input',
        initialValue: data?.info?.slogan || '',
      },
    ];
  };

  inSignUpRange = () => {
    const registerStartAt = new Date(this.props.data.registerStartAt);
    const registerEndAt = new Date(this.props.data.registerEndAt);
    const serverTime = Date.now() - ((window as any)._t_diff || 0);
    return registerStartAt.getTime() <= serverTime && serverTime < registerEndAt.getTime();
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

  renderSignUpArea = (data: ICompetition) => {
    const { selfParticipant } = this.state;
    return (
      <div className="competition-sign-up text-center">
        <h3>Sign Up</h3>
        <div>
          Time range to sign up:{' '}
          <span className="nowrap">
            {data.registerStartAt && data.registerEndAt
              ? `${moment(data.registerStartAt).format('YYYY-MM-DD HH:mm:ss')} ~ ${moment(
                  data.registerEndAt,
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
    const { loading, data, id } = this.props;
    if (!loading && !data.competitionId) {
      return <NotFound />;
    }

    return (
      <PageAnimation>
        <PageTitle title={data.title} loading={loading}>
          <div className="competition-intro competition-theme-sdutpc">
            <div className="competition-logo">
              <img src={SdutpcLogo} alt="SDUTPC" />
            </div>
            <div className="competition-intro-content content-view">
              <h2 className="competition-intro-header">{data.title}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: xss(data.introduction) }}
                className="content-area"
                style={{ marginTop: '48px' }}
              />
              <Divider style={{ margin: '16px 0' }} />
              {/* sign up area */}
              {this.renderSignUpArea(data)}
            </div>
          </div>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.public.intro);
  const data = state.competitions.detail[id] || ({} as ICompetition);
  const theme = state.settings.theme;
  return {
    id,
    session: state.session,
    loading: !!state.loading.effects['competitions/getDetail'],
    data,
    theme,
  };
}

export default connect(mapStateToProps)(CompetitionIntro);
