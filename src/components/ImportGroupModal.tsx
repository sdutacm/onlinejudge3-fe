import React from 'react';
import { connect } from 'dva';
import { Form, Modal, Collapse } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import ExcelSelectParser from './ExcelSelectParser';
import staticUrls from '@/configs/staticUrls';
import router from 'umi/router';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import constants from '@/configs/constants';

export interface Props extends ReduxProps, FormProps {}

interface State {
  visible: boolean;
  data: {
    name: string;
    usernames: string[];
  } | null;
  loading: boolean;
}

class ImportGroupModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: null,
      loading: false,
    };
  }

  handleExcelChange = (aoa: any[][]) => {
    const name = aoa[0][0];
    const members = aoa.slice(2).map((row) => `${row[0]}`);
    if (name) {
      this.setState({
        data: {
          name,
          usernames: members,
        },
      });
    } else {
      this.setState({
        data: null,
      });
    }
  };

  handleOk = async () => {
    const { dispatch, form } = this.props;
    const { data } = this.state;
    this.setState({
      loading: true,
    });
    try {
      const addGroupRet: IApiResponse<{ groupId: number }> = await dispatch({
        type: 'groups/addEmptyGroup',
        payload: {
          data: {
            name: data.name,
            intro: '',
            verified: true,
            private: false,
          },
        },
      });
      msg.auto(addGroupRet);
      if (addGroupRet.success) {
        const groupId = addGroupRet.data.groupId;
        const addGroupMemberRet: IApiResponse = await dispatch({
          type: 'groups/addGroupMember',
          payload: {
            id: groupId,
            data: {
              usernames: data.usernames,
            },
          },
        });
        msg.auto(addGroupMemberRet);
        if (addGroupMemberRet.success) {
          tracker.event({
            category: 'groups',
            action: 'importGroup',
          });
          msg.success('Import successfully');
          this.handleHideModel();
          setTimeout(
            () => router.push(urlf(pages.groups.detail, { param: { id: groupId } })),
            constants.modalAnimationDurationFade,
          );
        }
      }
    } finally {
      this.setState({
        loading: false,
      });
    }
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
          title="Import to Generate Group"
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
                templateUrl={staticUrls.templates.group}
                onChange={this.handleExcelChange}
              />
            </Form.Item>
            {data ? (
              <Form.Item label="Preview" className="mb-none">
                <span className="ant-form-text">Group name: {data.name}</span>
                <Collapse bordered={false} className="single-panel">
                  <Collapse.Panel
                    key={`${Date.now()}`}
                    header={`${data.usernames.length} members(s)`}
                  >
                    {data.usernames.map((username) => (
                      <p key={username} className="mb-none">
                        {username}
                      </p>
                    ))}
                  </Collapse.Panel>
                </Collapse>
              </Form.Item>
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

export default connect(mapStateToProps)(Form.create()(ImportGroupModal));
