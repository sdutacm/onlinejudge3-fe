import React from 'react';
import { Upload, Icon } from 'antd';
import { RcFile, UploadFile } from 'antd/lib/upload/interface';
import XLSX from 'xlsx';
import tracker from '@/utils/tracker';
import { getCsrfHeader } from '@/utils/misc';

export interface Props {
  templateUrl: string;
  onChange?(aoa: any[][], worksheet: XLSX.WorkSheet, workbook: XLSX.WorkBook): void;
}

interface State {
  fileList: Array<UploadFile>;
}

class ExcelSelectParser extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
    };
  }

  beforeUpload = (file: RcFile, _fileList: RcFile[]) => {
    this.setState({
      fileList: [file],
    });
    tracker.event({
      category: 'component.ExcelSelectParser',
      action: 'selectFile',
    });
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!worksheet) {
        return;
      }
      const aoa: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      this.props.onChange?.(aoa, worksheet, workbook);
    };
    reader.readAsBinaryString(file);
    return false;
  };

  render() {
    const { templateUrl } = this.props;
    const { fileList } = this.state;

    return (
      <Upload.Dragger
        name="sheet"
        // @ref https://docs.microsoft.com/zh-cn/archive/blogs/vsofficedeveloper/office-2007-file-format-mime-types-for-http-content-streaming-2
        accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        multiple={false}
        showUploadList={{ showRemoveIcon: false }}
        fileList={fileList}
        beforeUpload={this.beforeUpload}
        headers={getCsrfHeader()}
      >
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">Click or drag an XLS/XLSX file to this area to upload</p>
        <p className="ant-upload-hint">
          If you don't know what to upload, download{' '}
          <a target="_blank" href={templateUrl} onClick={(e) => e.stopPropagation()}>
            template
          </a>{' '}
          and fill it.
        </p>
      </Upload.Dragger>
    );
  }
}

export default ExcelSelectParser;
