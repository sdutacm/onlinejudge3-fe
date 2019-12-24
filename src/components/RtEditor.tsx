import React from 'react';
import { Upload, Icon } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import msg from '@/utils/msg';
import { validateFile } from '@/utils/validate';
import BraftEditor from 'braft-editor';
import { ContentUtils } from 'braft-utils'
import 'braft-editor/dist/index.css';
import api from '@/configs/apis';
import constants from '@/configs/constants';

interface Props {
  form: WrappedFormUtils;
  disabled?: boolean;
  className?: string;
  contentStyle?: React.CSSProperties;
}

interface State {
  fileList: UploadFile[];
}

class RtEditor extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    disabled: false,
    className: '',
  };

  static genEmptyContent = () => BraftEditor.createEditorState(null);

  private validateMedia = validateFile([
    { name: 'JPG', type: 'image/jpeg' },
    { name: 'BMP', type: 'image/bmp' },
    { name: 'PNG', type: 'image/png' }],
    8
  );

  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
    };
  }

  componentDidMount() {
    // @ts-ignore
    const fieldName: string = this.props.id; // from antd form
    this.props.form.setFieldsValue({
      [fieldName]: BraftEditor.createEditorState(null),
    });
  }

  handleUploadMediaChange = (info) => {
    const { form } = this.props;
    // @ts-ignore
    const fieldName: string = this.props.id;
    const { file, fileList } = info;
    if (file.status === 'done') {
      const resp = file.response;
      msg.auto(resp);
      if (resp.success) {
        const editorStateBefore = form.getFieldValue(fieldName);
        const editorState = ContentUtils.insertMedias(editorStateBefore, [{
          type: 'IMAGE',
          url: `${constants.mediaUrlPrefix}${resp.data.url}`,
        }]);
        form.setFieldsValue({
          [fieldName]: editorState
        });
      }
    }
    const newFileList = fileList.filter(f => f.status === 'uploading');
    this.setState({
      fileList: newFileList,
    });
  };

  render() {
    const editorExtendControls = [
      {
        key: 'media-uploader',
        type: 'component',
        component: (
          <Upload
            name="image"
            accept="image/jpeg,image/bmp,image/png"
            action={`${api.base}${api.common.media}`}
            beforeUpload={this.validateMedia}
            onChange={this.handleUploadMediaChange}
            fileList={this.state.fileList}
          >
            <button type="button" className="control-item button upload-button" data-title="Insert Image">
              <Icon type="picture" theme="filled" />
            </button>
          </Upload>
        ),
      },
    ] as {
      key: string;
      type: 'component';
      component: React.ReactNode;
    }[];

    const innerProps = { ...this.props };
    delete innerProps.form;
    delete innerProps.className;

    return (
      // @ts-ignore
      <BraftEditor
        controls={[
          'headings', 'bold', 'italic', 'underline', 'list-ul', 'list-ol',
          'link', 'emoji', 'code',
        ]}
        extendControls={editorExtendControls}
        className={`rt-editor ${this.props.className}`}
        language="en"
        {...innerProps}
      />
    );
  }
}

export default RtEditor;