import React from 'react';
import { connect } from 'dva';
import { Form, Modal, Collapse, Table, Select } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import ExcelSelectParser from './ExcelSelectParser';
import staticUrls from '@/configs/staticUrls';
import constants from '@/configs/constants';
import { withRouter } from 'react-router';
import { ICompetitionUser } from '@/common/interfaces/competition';
import { set as safeSet } from 'lodash';
import { ECompetitionUserRole, ECompetitionUserStatus } from '@/common/enums';

const MAX_MEMBER_NUM = 3;

export interface Props extends RouteProps, ReduxProps, FormProps {
  competitionId: number;
}

type IImportCompetitionUser = Omit<ICompetitionUser, 'competitionId' | 'createdAt'>;

interface State {
  visible: boolean;
  data: IImportCompetitionUser[] | null;
  loading: boolean;
}

class ImportCompetitionUserModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: null,
      loading: false,
    };
  }

  handleExcelChange = (aoa: any[][]) => {
    try {
      const fields = aoa[0];
      let valid = true;
      const users = aoa.slice(1).map((row) => {
        // @ts-ignore
        const user: IImportCompetitionUser = {};
        fields.forEach((field, index) => {
          switch (field) {
            case 'userId': {
              user[field] = Number(row[index]);
              if (!user[field] || user[field] <= 0) {
                valid = false;
              }
              break;
            }
            case 'role': {
              user[field] = Number(row[index]);
              if (!ECompetitionUserRole[user[field]]) {
                valid = false;
              }
              break;
            }
            case 'status': {
              user[field] = Number(row[index]);
              if (!ECompetitionUserStatus[user[field]]) {
                valid = false;
              }
              break;
            }
            case 'password':
            case 'fieldShortName':
              user[field] = row[index] || null;
              break;
            case 'seatNo':
              user[field] = Number(row[index]) || null;
              break;
            case 'banned':
            case 'unofficialParticipation':
              user[field] =
                typeof row[index] === 'boolean'
                  ? row[index]
                  : typeof row[index] === 'string' &&
                    ((row[index] as string).toUpperCase() === 'TRUE' ||
                      (row[index] as string).toUpperCase() === 'Y');
              break;
            default:
              row[index] && safeSet(user, field, `${row[index]}`);
          }
        });
        return user;
      });
      console.log('parsed import users:', users);
      if (!valid) {
        msg.error('Invalid sheet. Please check again');
        throw new Error('Invalid Sheet');
      }
      this.setState({
        data: users,
      });
    } catch (e) {
      this.setState({
        data: null,
      });
    }
  };

  handleOk = async () => {
    const {
      dispatch,
      form,
      location: { query },
      competitionId,
    } = this.props;
    const { data } = this.state;
    form.validateFields(async (err, values) => {
      if (!err) {
        const { conflict } = values;
        this.setState({
          loading: true,
        });
        try {
          const ret: IApiResponse = await dispatch({
            type: 'competitions/batchCreateCompetitionUsers',
            payload: {
              id: competitionId,
              data: {
                users: data,
                conflict,
              },
            },
          });
          msg.auto(ret);
          tracker.event({
            category: 'competition',
            action: 'importUsers',
          });
          msg.success('Import successfully');
          this.handleHideModel();
          setTimeout(() => {
            dispatch({
              type: 'competitions/getAllCompetitionUsers',
              payload: {
                id: competitionId,
              },
            });
            form.resetFields();
            this.setState({
              data: null,
            });
          }, constants.modalAnimationDurationFade);
        } finally {
          this.setState({
            loading: false,
          });
        }
      }
    });
  };

  handleShowModel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, form } = this.props;
    const { getFieldDecorator } = form;
    const { data, loading } = this.state;
    const _m = new Array(MAX_MEMBER_NUM).fill(undefined);

    return (
      <>
        <span onClick={this.handleShowModel}>{children}</span>
        <Modal
          title="Import Users"
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
          okButtonProps={{ disabled: !data }}
          width={960}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Upload Sheet">
              <ExcelSelectParser onChange={this.handleExcelChange} />
            </Form.Item>
            {data ? (
              <>
                <Form.Item label="Preview" className="mb-none">
                  <Collapse bordered={false} className="single-panel">
                    <Collapse.Panel key={`${Date.now()}`} header={`${data.length} user(s)`}>
                      <Table
                        dataSource={data}
                        rowKey="userId"
                        pagination={false}
                        className="responsive-table nowrap"
                        style={{ overflow: 'auto' }}
                      >
                        <Table.Column
                          title=""
                          key="unofficialParticipation"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.unofficialParticipation && '*'}</span>
                          )}
                        />
                        <Table.Column
                          title="UID"
                          key="userId"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.userId}</span>
                          )}
                        />
                        <Table.Column
                          title="Role"
                          key="role"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.role}</span>
                          )}
                        />
                        <Table.Column
                          title="Status"
                          key="status"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.status}</span>
                          )}
                        />
                        <Table.Column
                          title="Password"
                          key="password"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.password}</span>
                          )}
                        />
                        <Table.Column
                          title="Field Short Name"
                          key="fieldShortName"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.fieldShortName}</span>
                          )}
                        />
                        <Table.Column
                          title="Seat No"
                          key="seatNo"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.seatNo}</span>
                          )}
                        />
                        <Table.Column
                          title="Banned"
                          key="banned"
                          render={(text, record: IImportCompetitionUser) => (
                            <span>{record.banned ? 'Y' : 'N'}</span>
                          )}
                        />
                        <Table.Column
                          title="Info"
                          key="info"
                          render={(text, record: IImportCompetitionUser) => {
                            const infoStr = JSON.stringify(record.info || {}, null, 2);
                            return <pre>{infoStr}</pre>;
                          }}
                        />
                      </Table>
                    </Collapse.Panel>
                  </Collapse>
                </Form.Item>
                <Form.Item key="conflict" label="When UID conflicts">
                  {getFieldDecorator('conflict', {
                    rules: [],
                    initialValue: 'insert',
                  })(
                    <Select>
                      {[
                        { name: 'Skip', value: 'insert' },
                        { name: 'Overwrite', value: 'upsert' },
                      ].map((opt) => (
                        <Select.Option key={opt.value}>{opt.name}</Select.Option>
                      ))}
                    </Select>,
                  )}
                </Form.Item>
              </>
            ) : null}
          </Form>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

// @ts-ignore
export default connect(mapStateToProps)(withRouter(Form.create()(ImportCompetitionUserModal)));
