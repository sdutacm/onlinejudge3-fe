/**
 * title: Competition Participants
 */

import React from 'react';
import { connect } from 'dva';
import { Card, Table, Tooltip, Tag } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import { ICompetitionUser, ICompetition } from '@/common/interfaces/competition';
import PageAnimation from '@/components/PageAnimation';
import PageLoading from '@/components/PageLoading';
import NotFound from '@/pages/404';
import { genshinCharacters } from '@/configs/genshin';
import markdownit from 'markdown-it';
import PageTitle from '@/components/PageTitle';

const md = markdownit().disable('image');
// Remember the old renderer if overridden, or proxy to the default renderer.
const defaultRender =
  md.renderer.rules.link_open ||
  function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
  // Add a new `target` attribute, or replace the value of the existing one.
  tokens[idx].attrSet('target', '_blank');

  // Pass the token to the default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

export interface Props extends ReduxProps, RouteProps {
  id: number;
  detail: ICompetition;
}

interface State {
  participants: ICompetitionUser[];
}

class CompetitionParticipants extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      participants: [],
    };
  }

  componentDidMount(): void {
    this.fetch(this.props);
  }

  componentWillReceiveProps(np: Props) {
    if (this.props.id !== np.id && np.id) {
      this.fetch(np);
    }
  }

  get isGenshin() {
    return this.props?.detail?.spConfig?.preset === 'genshin';
  }

  computeSubname = (user: ICompetitionUser): string => {
    if (user.info.subname) {
      return user.info.subname;
    }
    const subnameExpr = this.props?.detail?.spConfig?.subnameExpr || null;
    if (!subnameExpr) {
      return '';
    }
    try {
      const expr = subnameExpr
        .replace(/\$userId/g, user.userId.toString())
        .replace(/\$unofficialParticipation/g, user.unofficialParticipation?.toString())
        .replace(/\$fieldShortName/g, user.fieldShortName?.toString())
        .replace(/\$seatNo/g, user.seatNo?.toString())
        .replace(/\$info\.([a-zA-Z][a-zA-Z0-9]*)/g, `\${${JSON.stringify(user.info || {})}.$1}`);
      console.log('compiled subname expression:', `\`${expr}\``);
      // eslint-disable-next-line no-eval
      const result = eval(`\`${expr}\``);
      if (typeof result === 'string') {
        return result;
      }
    } catch (e) {
      console.error('Error evaluating subname expression:', subnameExpr, user, e);
    }
    return '';
  };

  fetch = async (props?: Props) => {
    const { id, dispatch } = props || this.props;
    const res = await dispatch({
      type: 'competitions/getPublicCompetitionParticipants',
      payload: {
        id,
      },
    });
    if (res.success) {
      this.setState({
        participants: res.data.rows,
      });
    }
  };

  renderUnofficialMark = (record: ICompetitionUser) => {
    if (record.unofficialParticipation) {
      return (
        <Tooltip title="Unofficial Participation">
          <Tag>＊</Tag>
        </Tooltip>
      );
    }
    return null;
  };

  renderPersonalParticipant = (record: ICompetitionUser) => {
    return (
      <div>
        <div className="competition-participant-name">
          {this.renderUnofficialMark(record)}
          {record.info.nickname}
          <span className="competition-participant-name-secondary text-secondary">
            ({this.computeSubname(record) || `${record.info.class} ${record.info.realName}`})
          </span>
        </div>
        {!!record.info.slogan && this.renderSlogan(record.info.slogan)}
      </div>
    );
  };

  renderTeamParticipant = (record: ICompetitionUser) => {
    return (
      <div>
        <div className="competition-participant-name">
          {this.renderUnofficialMark(record)}
          {record.info.nickname}
          <span className="competition-participant-name-secondary text-secondary">
            ({record.info.members.map((m) => `${m.class} ${m.realName}`).join(' / ')})
          </span>
        </div>
        {!!record.info.slogan && this.renderSlogan(record.info.slogan)}
      </div>
    );
  };

  renderGenshinParticipant = (record: ICompetitionUser) => {
    return (
      <div>
        <p
          className="competition-participant-name"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span>
            {record.info.nickname}
            <span className="competition-participant-name-secondary text-secondary">
              ({record.info.school})
            </span>
          </span>

          <span>{this.renderGenshinInfo(record.info as any)}</span>
        </p>
        {!!record.info.slogan && this.renderSlogan(record.info.slogan)}
      </div>
    );
  };

  renderGenshinInfo = (info: { genshinXpCharacter: string; genshinUid: string }) => {
    const characterConfig = genshinCharacters.find((c) => c.id === info.genshinXpCharacter);
    if (!characterConfig) {
      return null;
    }
    return (
      <Tooltip
        title={
          <span>
            XP: {characterConfig.nameZh}
            {!!info.genshinUid && (
              <>
                <span className="ml-md">/</span>
                <span className="ml-md">
                  UID: <span>{info.genshinUid}</span>{' '}
                </span>
              </>
            )}
          </span>
        }
      >
        <img
          src={characterConfig.avatarIconSideUrl}
          alt={characterConfig.nameZh}
          style={{ height: '30px' }}
        />
      </Tooltip>
    );
  };

  renderSlogan = (slogan = '') => {
    const result = md.renderInline(slogan);
    return (
      <p
        className="competition-participant-slogan font-family-amaz-chinese"
        dangerouslySetInnerHTML={{ __html: result }}
      ></p>
    );
  };

  render() {
    const { id, loading, detail } = this.props;
    const { participants } = this.state;

    if (loading) {
      return <PageLoading />;
    }
    if (!detail?.competitionId) {
      return <NotFound />;
    }
    const isTeam = detail.isTeam;

    return (
      <PageAnimation>
        <PageTitle title={`Participants of ${detail.title}`} loading={loading}>
          <div className="content-view">
            <Card bordered={false} className="list-card">
              <Table
                dataSource={participants}
                rowKey="userId"
                loading={loading}
                pagination={false}
                className="responsive-table no-header-table listlike-table competition-participant-list"
              >
                <Table.Column
                  title="Info"
                  key="Info"
                  className="competition-participant-item"
                  render={(text, record: ICompetitionUser) =>
                    this.isGenshin
                      ? this.renderGenshinParticipant(record)
                      : isTeam
                      ? this.renderTeamParticipant(record)
                      : this.renderPersonalParticipant(record)
                  }
                />
              </Table>
            </Card>
          </div>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(
    state.routing.location.pathname,
    pages.competitions.public.participants,
  );
  const detail = state.competitions.detail[id] || ({} as ICompetition);
  return {
    id,
    detail,
    loading:
      !!state.loading.effects['competitions/getDetail'] ||
      !!state.loading.effects['competitions/getPublicCompetitionParticipants'],
  };
}

export default connect(mapStateToProps)(CompetitionParticipants);
