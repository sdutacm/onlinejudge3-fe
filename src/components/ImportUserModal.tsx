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

export interface Props extends RouteProps, ReduxProps, FormProps {}

interface IImportUser {
  username: IUser['username'];
  nickname: IUser['nickname'];
  school: IUser['school'];
  college: IUser['college'];
  major: IUser['major'];
  class: IUser['class'];
  grade: string;
  password: string;
}

interface State {
  visible: boolean;
  data: IImportUser[] | null;
  loading: boolean;
}

class ImportUserModal extends React.Component<Props, State> {
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
      const users = aoa.slice(1).map((row) => ({
        username: `${row[0] || ''}`,
        nickname: `${row[1] || ''}`,
        school: `${row[2] || ''}`,
        college: `${row[3] || ''}`,
        major: `${row[4] || ''}`,
        class: `${row[5] || ''}`,
        grade: `${row[6] || ''}`,
        password: `${row[7] || ''}`,
      }));
      for (const user of users) {
        if (!user.username || !user.nickname || !user.password) {
          msg.error('Invalid sheet. Please check again');
          throw new Error('Invalid Sheet');
        }
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
    const { dispatch, form } = this.props;
    const { data } = this.state;
    form.validateFields(async (err, values) => {
      if (!err) {
        const { conflict } = values;
        const d = {
          users: data,
          conflict,
        };
        console.log(d);
        this.setState({
          loading: true,
        });
        try {
          const ret: IApiResponse = await dispatch({
            type: 'admin/batchCreateUsers',
            payload: d,
          });
          msg.auto(ret);
          tracker.event({
            category: 'admin',
            action: 'importUsers',
          });
          msg.success('Import successfully');
          this.handleHideModel();
          setTimeout(() => {
            dispatch({
              type: 'admin/getUserList',
              payload: this.props.location.query,
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
                templateUrl={staticUrls.templates.user}
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
                          title="Username"
                          key="username"
                          render={(text, record: IImportUser) => <span>{record.username}</span>}
                        />
                        <Table.Column
                          title="Nickname"
                          key="nickname"
                          render={(text, record: IImportUser) => <span>{record.nickname}</span>}
                        />
                        <Table.Column
                          title="School"
                          key="school"
                          render={(text, record: IImportUser) => <span>{record.school}</span>}
                        />
                        <Table.Column
                          title="College"
                          key="college"
                          render={(text, record: IImportUser) => <span>{record.college}</span>}
                        />
                        <Table.Column
                          title="Major"
                          key="major"
                          render={(text, record: IImportUser) => <span>{record.major}</span>}
                        />
                        <Table.Column
                          title="Class"
                          key="class"
                          render={(text, record: IImportUser) => <span>{record.class}</span>}
                        />
                        <Table.Column
                          title="Grade"
                          key="grade"
                          render={(text, record: IImportUser) => <span>{record.grade}</span>}
                        />
                        <Table.Column
                          title="Password"
                          key="password"
                          render={(text, record: IImportUser) => <span>{record.password}</span>}
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
export default connect(mapStateToProps)(withRouter(Form.create()(ImportUserModal)));
