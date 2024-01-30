/**
 * title: Competition Participants
 */

import React from 'react';
import { connect } from 'dva';
import { Card, Table, Tooltip } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import { ICompetitionUser, ICompetition } from '@/common/interfaces/competition';
import PageAnimation from '@/components/PageAnimation';
import PageLoading from '@/components/PageLoading';
import NotFound from '@/pages/404';
import { genshinCharacters } from '@/configs/genshin';
import markdownit from 'markdown-it';

const md = markdownit().disable('image');

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

  renderParticipant = (record: ICompetitionUser) => {
    return (
      <div>
        <p className="competition-participant-name">
          {record.info.nickname}
          <span className="competition-participant-name-secondary text-secondary">
            ({record.info.class} {record.info.realName})
          </span>
        </p>
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

  renderSlogan = (slogan: string) => {
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

    return (
      <PageAnimation>
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
                    : this.renderParticipant(record)
                }
              />
            </Table>
          </Card>
        </div>
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
