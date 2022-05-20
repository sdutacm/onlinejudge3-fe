/**
 * title: Competition Participants
 */

import React from 'react';
import { connect } from 'dva';
import { Card, Table } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import { ICompetitionUser } from '@/common/interfaces/competition';
import PageAnimation from '@/components/PageAnimation';
import { urlf } from '@/utils/format';
import Link from 'umi/link';

export interface Props extends ReduxProps, RouteProps {
  id: number;
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

  render() {
    const { id, loading } = this.props;
    const { participants } = this.state;
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
                render={(text, record: ICompetitionUser) => (
                  <div>
                    <p className="competition-participant-name">
                      {record.info.nickname}
                      <span className="competition-participant-name-secondary text-secondary">
                        ({record.info.class} {record.info.realName})
                      </span>
                    </p>
                    {!!record.info.slogan && (
                      <p className="competition-participant-slogan font-family-amaz-chinese">
                        {record.info.slogan}
                      </p>
                    )}
                  </div>
                )}
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
  return {
    id,
    loading: !!state.loading.effects['competitions/getPublicCompetitionParticipants'],
  };
}

export default connect(mapStateToProps)(CompetitionParticipants);
