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

const MAX_MEMBER_NUM = 3;

export interface Props extends RouteProps, ReduxProps, FormProps {
  contestId: number;
}

interface IImportContestUser {
  username: IContestUser['username'];
  nickname: IContestUser['nickname'];
  subname?: IContestUser['subname'];
  sitNo?: IContestUser['sitNo'];
  unofficial: IContestUser['unofficial'];
  password: IContestUser['password'];
  members: {
    schoolNo: string;
    name: string;
    school: string;
    college: string;
    major: string;
    class: string;
    tel: string;
    email: string;
    clothing: string;
  }[];
}

interface State {
  visible: boolean;
  data: IImportContestUser[] | null;
  loading: boolean;
}

class ImportContestUserModal extends React.Component<Props, State> {
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
      const users = aoa.slice(1).map((row) => {
        const user = {
          username: `${row[0] || ''}`,
          nickname: `${row[1] || ''}`,
          subname: `${row[2] || ''}`,
          sitNo: `${row[3] || ''}`,
          unofficial: row[4] === 'Y',
          password: `${row[5] || ''}`,
          members: [],
        };
        const memberBeginIndex = 6;
        const memberFieldNum = 9;
        for (let i = 0; i < MAX_MEMBER_NUM; ++i) {
          const member = {
            schoolNo: `${row[memberBeginIndex + i * memberFieldNum] || ''}`,
            name: `${row[memberBeginIndex + i * memberFieldNum + 1] || ''}`,
            school: `${row[memberBeginIndex + i * memberFieldNum + 2] || ''}`,
            college: `${row[memberBeginIndex + i * memberFieldNum + 3] || ''}`,
            major: `${row[memberBeginIndex + i * memberFieldNum + 4] || ''}`,
            class: `${row[memberBeginIndex + i * memberFieldNum + 5] || ''}`,
            tel: `${row[memberBeginIndex + i * memberFieldNum + 6] || ''}`,
            email: `${row[memberBeginIndex + i * memberFieldNum + 7] || ''}`,
            clothing: `${row[memberBeginIndex + i * memberFieldNum + 8] || ''}`,
          };
          user.members.push(member);
        }
        return user;
      });
      for (const user of users) {
        if (!user.username || !user.nickname) {
          msg.error('Invalid sheet. Please check again');
          throw new Error('Invalid Sheet');
        }
      }
      this.setState({
        data: users,
      });
      console.log(users);
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
      contestId,
    } = this.props;
    const { data } = this.state;
    form.validateFields(async (err, values) => {
      if (!err) {
        const { conflict } = values;
        const d = {
          contestId,
          users: data,
          conflict,
        };
        this.setState({
          loading: true,
        });
        try {
          const ret: IApiResponse = await dispatch({
            type: 'admin/batchCreateContestUsers',
            payload: d,
          });
          msg.auto(ret);
          tracker.event({
            category: 'admin',
            action: 'importContestUsers',
          });
          msg.success('Import successfully');
          this.handleHideModel();
          setTimeout(() => {
            dispatch({
              type: 'contests/getUserList',
              payload: {
                cid: contestId,
                query,
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
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Upload Sheet">
              <ExcelSelectParser
                templateUrl={staticUrls.templates.contestUser}
                onChange={this.handleExcelChange}
              />
            </Form.Item>
            {data ? (
              <>
                <Form.Item label="Preview" className="mb-none">
                  <Collapse bordered={false} className="single-panel">
                    <Collapse.Panel key={`${Date.now()}`} header={`${data.length} user(s)`}>
                      <Table
                        dataSource={data}
                        rowKey="username"
                        pagination={false}
                        className="responsive-table nowrap"
                        style={{ overflow: 'auto' }}
                      >
                        <Table.Column
                          title=""
                          key="unofficial"
                          render={(text, record: IImportContestUser) => (
                            <span>{record.unofficial && '*'}</span>
                          )}
                        />
                        <Table.Column
                          title="Username"
                          key="username"
                          render={(text, record: IImportContestUser) => (
                            <span>{record.username}</span>
                          )}
                        />
                        <Table.Column
                          title="Nickname"
                          key="nickname"
                          render={(text, record: IImportContestUser) => (
                            <span>{record.nickname}</span>
                          )}
                        />
                        <Table.Column
                          title="Subname"
                          key="subname"
                          render={(text, record: IImportContestUser) => (
                            <span>{record.subname}</span>
                          )}
                        />
                        <Table.Column
                          title="Password"
                          key="password"
                          render={(text, record: IImportContestUser) => (
                            <span>{record.password}</span>
                          )}
                        />
                        <Table.Column
                          title="Sit No."
                          key="sitNo"
                          render={(text, record: IImportContestUser) => <span>{record.sitNo}</span>}
                        />
                        <Table.Column
                          title="Student No."
                          key="schoolNo"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].schoolNo}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="Name"
                          key="name"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].name}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="School"
                          key="school"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].school}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="College"
                          key="college"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].college}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="Major"
                          key="major"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].major}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="Class"
                          key="class"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].class}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="Tel"
                          key="tel"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].tel}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="Email"
                          key="email"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].email}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                        <Table.Column
                          title="Clothing"
                          key="clothing"
                          render={(text, record: IImportContestUser) => (
                            <div>
                              {_m.map((_item, index) => (
                                <p key={index} className="mb-none">
                                  {record.members[index].clothing}
                                </p>
                              ))}
                            </div>
                          )}
                        />
                      </Table>
                    </Collapse.Panel>
                  </Collapse>
                </Form.Item>
                <Form.Item key="conflict" label="When username conflicts">
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
export default connect(mapStateToProps)(withRouter(Form.create()(ImportContestUserModal)));
