import React from 'react';
import { connect } from 'dva';
import { Form, Modal, Collapse, Table, Select, Upload, Icon, Input } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import staticUrls from '@/configs/staticUrls';
import constants from '@/configs/constants';
import { withRouter } from 'react-router';
import { getCsrfHeader } from '@/utils/misc';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import ExtLink from './ExtLink';

export interface Props extends RouteProps, ReduxProps, FormProps {
  problemId?: number;
}

interface State {
  visible: boolean;
  // data: ArrayBuffer | string | null;
  fileList: Array<UploadFile>;
  loading: boolean;
}

class UploadJudgerDataModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      // data: null,
      fileList: [],
      loading: false,
    };
  }

  beforeUpload = (file: RcFile, _fileList: RcFile[]) => {
    this.setState({
      fileList: [file],
    });
    tracker.event({
      category: 'component.UploadJudgerDataModal',
      action: 'selectFile',
    });
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   const data = e.target.result;
    //   this.setState({
    //     data,
    //   });
    // };
    // reader.readAsBinaryString(file);
    return false;
  };

  handleOk = async () => {
    const { dispatch, form, problemId } = this.props;
    const { fileList } = this.state;
    const data = fileList[0];
    if (!data) {
      msg.error('Please select data archive');
      return;
    }
    form.validateFields(async (err, values) => {
      if (!err) {
        const { commitMessage, gitUsername: name, email } = values;
        const formData = new FormData();
        formData.append('problemId', `${problemId}`);
        // @ts-ignore
        formData.append('data', data, `upload-data.zip`);
        formData.append('commitMessage', commitMessage);
        formData.append('name', name);
        formData.append('email', email);
        this.setState({
          loading: true,
        });
        try {
          let ret: IApiResponse = await dispatch({
            type: 'admin/prepareJudgerDataUpdate',
            payload: {},
          });
          msg.auto(ret);
          if (!ret.success) {
            return;
          }
          ret = await dispatch({
            type: 'admin/uploadJudgerData',
            payload: {
              data: formData,
            },
          });
          msg.auto(ret);
          tracker.event({
            category: 'admin',
            action: 'UploadJudgerData',
          });
          msg.success('Upload successfully');
          this.handleHideModel();
          setTimeout(() => {
            dispatch({
              type: 'admin/getProblemDataFiles',
              payload: {
                id: problemId,
              },
            });
            form.resetFields();
            this.setState({
              fileList: [],
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
    const { loading, fileList } = this.state;

    return (
      <>
        <span onClick={this.handleShowModel}>{children}</span>
        <Modal
          title="Upload Data Archive"
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
          okButtonProps={{ disabled: !fileList[0] }}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Data Archive">
              <Upload.Dragger
                name="data"
                accept="application/zip"
                multiple={false}
                showUploadList={{ showRemoveIcon: false }}
                fileList={fileList}
                beforeUpload={this.beforeUpload}
                headers={getCsrfHeader()}
              >
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Click or drag an zip file to this area to upload</p>
                <p className="ant-upload-hint">
                  If you don't know what content to upload, download{' '}
                  <a
                    target="_blank"
                    href={staticUrls.templates.judgerDataArchive}
                    onClick={(e) => e.stopPropagation()}
                  >
                    demo
                  </a>
                </p>
              </Upload.Dragger>
            </Form.Item>
            <Form.Item key="commitMessage" label="Commit Message">
              {getFieldDecorator('commitMessage', {
                rules: [{ required: true, message: 'Please input this field' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item key="gitUsername" label="Git Username">
              {getFieldDecorator('gitUsername', {
                rules: [{ required: true, message: 'Please input this field' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item key="email" label="Git Email">
              {getFieldDecorator('email', {
                rules: [{ required: true, message: 'Please input this field' }],
              })(<Input />)}
            </Form.Item>
          </Form>

          <div>
            <p>
              <strong>Caution</strong>: all files in data directory will be replaced by files
              in archive.
            </p>
            <p>Everytime you upload data archive, you must input all fields above.</p>
            <ul>
              <li>
                <strong>Commit Message</strong>: briefly describe what you update
              </li>
              <li>
                <strong>Git Username</strong>: your GitHub username (for example, if your GitHub
                page URL is{' '}
                <ExtLink href="https://github.com/dreamerblue">
                  https://github.com/dreamerblue
                </ExtLink>
                , your username is "dreamerblue" (without quotes)
              </li>
              <li>
                <strong>Git Email</strong>: Your GitHub email address. If you don't know which is,
                browse{' '}
                <ExtLink href="https://github.com/settings/email">
                  https://github.com/settings/emails
                </ExtLink>{' '}
                to review it
              </li>
            </ul>
          </div>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

// @ts-ignore
export default connect(mapStateToProps)(withRouter(Form.create()(UploadJudgerDataModal)));
