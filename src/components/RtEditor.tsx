import React from 'react';
import { Upload, Icon } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import msg from '@/utils/msg';
import { validateFile } from '@/utils/validate';
import 'braft-editor/dist/index.css';
// braft-editor is a browser-only UMD that references `window` at module eval, so
// importing it on the server crashes SSR. RtEditor is reachable from many page
// chunks (GeneralForm → GeneralFormModal), so we load braft lazily in the browser
// only and render nothing on the server (a rich-text editor isn't part of SSR).
let BraftEditor: any = null;
let ContentUtils: any = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  BraftEditor = require('braft-editor').default || require('braft-editor');
  // eslint-disable-next-line global-require
  ContentUtils = require('braft-utils').ContentUtils;
}
import api from '@/configs/apis';
import constants from '@/configs/constants';
import tracker from '@/utils/tracker';
import { routesBe } from '@/common/routes';
import { getCsrfHeader } from '@/utils/misc';

interface Props {
  form: WrappedFormUtils;
  value: any;
  disabled?: boolean;
  className?: string;
  contentStyle?: React.CSSProperties;
  uploadTarget?: 'media' | 'asset';
  uploadOption?: {
    prefix?: string;
    maxSize?: number; // MiB
  };
}

interface State {
  fileList: UploadFile[];
}

class RtEditor extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    disabled: false,
    className: '',
    uploadTarget: 'media',
    uploadOption: {},
  };

  static genEmptyContent = () => (BraftEditor ? BraftEditor.createEditorState(null) : null);

  private validateMedia = validateFile(
    [
      { name: 'JPG', type: 'image/jpeg' },
      { name: 'BMP', type: 'image/bmp' },
      { name: 'PNG', type: 'image/png' },
      { name: 'GIF', type: 'image/gif' },
    ],
    this.props.uploadOption?.maxSize || 8,
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
    if (!this.props.value || typeof this.props.value === 'string') {
      this.props.form.setFieldsValue({
        [fieldName]: BraftEditor.createEditorState(this.props.value || null),
      });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    // @ts-ignore
    const fieldName: string = this.props.id;
    if (
      nextProps.value !== this.props.value &&
      (!nextProps.value || typeof nextProps.value === 'string')
    ) {
      this.props.form.setFieldsValue({
        [fieldName]: BraftEditor.createEditorState(nextProps.value || null),
      });
    }
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
        const editorState = ContentUtils.insertMedias(editorStateBefore, [
          {
            type: 'IMAGE',
            url: `${constants.imageDirPrefix}${resp.data.url}`,
          },
        ]);
        form.setFieldsValue({
          [fieldName]: editorState,
        });
        tracker.event({
          category: 'component.RtEditor',
          action: 'uploadMedia',
        });
      }
    }
    const newFileList = fileList.filter((f) => f.status === 'uploading');
    this.setState({
      fileList: newFileList,
    });
  };

  render() {
    // braft is client-only; on the server (or before it loads) render nothing.
    if (!BraftEditor) {
      return null;
    }
    const uploadUrl =
      this.props.uploadTarget === 'asset'
        ? `${api.base}${routesBe.uploadAsset.url}`
        : `${api.base}${routesBe.uploadMedia.url}`;
    const uploadOption = this.props.uploadOption;
    const extraData = {
      prefix: uploadOption.prefix,
    };
    const editorExtendControls = [
      {
        key: 'media-uploader',
        type: 'component',
        component: (
          <Upload
            name="image"
            accept="image/jpeg,image/bmp,image/png,image/gif"
            action={uploadUrl}
            beforeUpload={this.validateMedia}
            onChange={this.handleUploadMediaChange}
            fileList={this.state.fileList}
            headers={getCsrfHeader()}
            data={extraData}
          >
            <button
              type="button"
              className="control-item button upload-button"
              data-title="Insert Image"
            >
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
          'headings',
          'bold',
          'italic',
          'underline',
          'list-ul',
          'list-ol',
          'link',
          'emoji',
          'code',
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
