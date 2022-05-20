/**
 * title: Audit
 */

import React from 'react';
import { connect } from 'dva';
import { Button, Tabs, Tag, Card, Table } from 'antd';
import { ReduxProps, RouteProps } from '@/@types/props';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import { ECompetitionUserRole, ECompetitionUserStatus } from '@/common/enums';
import { ICompetitionUser } from '@/common/interfaces/competition';
import PageAnimation from '@/components/PageAnimation';
import GeneralFormModal from '@/components/GeneralFormModal';
import { urlf } from '@/utils/format';
import Link from 'umi/link';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  session: ICompetitionSessionStatus;
}

interface State {
  currentActiveStatus: ECompetitionUserStatus;
  users: ICompetitionUser[];
}

class CompetitionAudit extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      currentActiveStatus: ECompetitionUserStatus.auditing,
      users: [],
    };
  }

  auditFormItems = [
    {
      name: 'Result',
      field: 'status',
      component: 'select',
      options: [
        { name: 'Accepted', value: ECompetitionUserStatus.available },
        { name: 'Modification Required', value: ECompetitionUserStatus.modificationRequired },
        { name: 'Rejected', value: ECompetitionUserStatus.rejected },
      ],
      initialValue: `${ECompetitionUserStatus.available}`,
      rules: [{ required: true, message: 'Please select status' }],
    },
    {
      name: 'Reason',
      field: 'reason',
      component: 'input',
      initialValue: '',
      placeholder: 'Reason to notice user (no need to fill if selected "Accepted")',
      rules: [],
    },
  ];

  componentDidMount(): void {
    this.fetch(this.props);
  }

  componentWillReceiveProps(np: Props) {
    if (this.props.id !== np.id && np.ip) {
      this.fetch(np);
    }
  }

  fetch = async (props?: Props) => {
    const { id, dispatch } = props || this.props;
    const res = await dispatch({
      type: 'competitions/getCompetitionUsers',
      payload: {
        id,
        query: { role: ECompetitionUserRole.participant },
      },
    });
    if (res.success) {
      this.setState({
        users: res.data.rows,
      });
    }
  };

  switchTab = (status) => {
    this.setState({
      currentActiveStatus: status,
    });
    this.fetch(this.props);
  };

  getUsersGroupedByStatus = () => {
    const { users } = this.state;
    const usersGrouped = {};
    [
      ECompetitionUserStatus.auditing,
      ECompetitionUserStatus.modificationRequired,
      ECompetitionUserStatus.rejected,
      ECompetitionUserStatus.available,
    ].forEach((status) => {
      usersGrouped[status] = users.filter((user) => user.status === status);
    });
    return usersGrouped;
  };

  render() {
    const { id, loading } = this.props;
    const { currentActiveStatus, users } = this.state;
    const usersGrouped = this.getUsersGroupedByStatus();
    return (
      <PageAnimation>
        <div>
          <Tabs
            activeKey={`${currentActiveStatus}`}
            onChange={(key) => this.switchTab(+key)}
            tabBarExtraContent={
              <Button
                size="small"
                shape="circle"
                icon="reload"
                onClick={() => this.fetch()}
              ></Button>
            }
          >
            <Tabs.TabPane
              tab={
                <span>
                  Under Auditing
                  <Tag className="ml-md">
                    {usersGrouped[ECompetitionUserStatus.auditing].length}
                  </Tag>
                </span>
              }
              key={`${ECompetitionUserStatus.auditing}`}
            />
            <Tabs.TabPane
              tab={
                <span>
                  Modification Required
                  <Tag className="ml-md">
                    {usersGrouped[ECompetitionUserStatus.modificationRequired].length}
                  </Tag>
                </span>
              }
              key={`${ECompetitionUserStatus.modificationRequired}`}
            />
            <Tabs.TabPane
              tab={
                <span>
                  Rejected
                  <Tag className="ml-md">
                    {usersGrouped[ECompetitionUserStatus.rejected].length}
                  </Tag>
                </span>
              }
              key={`${ECompetitionUserStatus.rejected}`}
            />
            <Tabs.TabPane
              tab={
                <span>
                  Accepted
                  <Tag className="ml-md">
                    {usersGrouped[ECompetitionUserStatus.available].length}
                  </Tag>
                </span>
              }
              key={`${ECompetitionUserStatus.available}`}
            />
          </Tabs>
        </div>
        <div>
          <Card bordered={false} className="list-card">
            <Table
              dataSource={usersGrouped[currentActiveStatus]}
              rowKey="userId"
              loading={loading}
              pagination={false}
              className="responsive-table listlike-table"
            >
              <Table.Column
                title="UID"
                key="UID"
                render={(text, record: ICompetitionUser) => (
                  <Link to={urlf(pages.users.detail, { param: { id: record.userId } })}>
                    {record.userId}
                  </Link>
                )}
              />
              <Table.Column
                title="Info"
                key="Info"
                render={(text, record: ICompetitionUser) => {
                  const infoStr = JSON.stringify(record.info || {}, null, 2);
                  return <pre>{infoStr}</pre>;
                }}
              />
              <Table.Column
                title="Action"
                key="Action"
                render={(text, record: ICompetitionUser) => (
                  <span>
                    <GeneralFormModal
                      loadingEffect="competitions/auditCompetitionParticipant"
                      title="Audit Registration"
                      autoMsg
                      items={this.auditFormItems}
                      submit={(dispatch: ReduxProps['dispatch'], values) => {
                        return dispatch({
                          type: 'competitions/auditCompetitionParticipant',
                          payload: {
                            id,
                            userId: record.userId,
                            data: {
                              status: +values.status,
                              reason: values.reason,
                            },
                          },
                        });
                      }}
                      onSuccess={(dispatch: ReduxProps['dispatch'], ret: IApiResponse<any>) => {
                        msg.success('Audit successfully');
                        tracker.event({
                          category: 'competitions',
                          action: 'auditCompetitionParticipant',
                        });
                      }}
                      onSuccessModalClosed={(
                        dispatch: ReduxProps['dispatch'],
                        ret: IApiResponse<any>,
                      ) => {
                        this.fetch();
                      }}
                    >
                      <a className="ml-md-lg">Audit</a>
                    </GeneralFormModal>
                  </span>
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
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.audit);
  return {
    id,
    session: state.competitions.session[id],
    loading: !!state.loading.effects['competitions/getCompetitionUsers'],
  };
}

export default connect(mapStateToProps)(CompetitionAudit);
