/**
 * title: Admin Problem Data
 */

import React from 'react';
import { connect } from 'dva';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { getPathParamId } from '@/utils/getPathParams';
import { Row, Col, Card, Table, Button, Drawer, Spin } from 'antd';
import msg from '@/utils/msg';
import filesize from 'filesize';
import moment from 'moment';
import ExtLink from '@/components/ExtLink';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { saveAs } from 'file-saver';
import { b64toBlob } from '@/utils/misc';
import UploadJudgerDataModal from '@/components/UploadJudgerDataModal';

const isProd = process.env.NODE_ENV === 'production';

export interface Props extends ReduxProps, RouteProps {
  id: number;
  problemDetail: IProblem;
  dataFileList: any[];
  downloadArchiveLoading: boolean;
}

interface State {
  drawerVisible: boolean;
  selectedPath: string;
  fileDetail: any;
  fileDetailLoading: boolean;
}

class AdminProblemDataList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      selectedPath: '',
      fileDetail: null,
      fileDetailLoading: false,
    };
  }

  handleHideDrawer = () => {
    this.setState({
      drawerVisible: false,
    });
  };

  handleShowFileDetail = (path) => {
    const { dispatch } = this.props;
    this.setState({
      selectedPath: path,
      drawerVisible: true,
      fileDetail: null,
      fileDetailLoading: true,
    });
    dispatch({
      type: 'admin/getDataFileDetail',
      payload: {
        path,
      },
    })
      .then((ret) => {
        msg.auto(ret);
        if (ret.success) {
          this.setState({
            fileDetail: ret.data,
          });
        }
      })
      .finally(() => {
        this.setState({
          fileDetailLoading: false,
        });
      });
  };

  handleDownload = async () => {
    const { fileDetail } = this.state;
    if (!fileDetail) {
      return;
    }
    if (!fileDetail.isBinary) {
      const blob = new Blob([fileDetail.content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, fileDetail.filename);
    } else {
      saveAs(await b64toBlob(fileDetail.content), fileDetail.filename);
    }
  };

  handleDownloadArchive = () => {
    const { id, dispatch } = this.props;
    dispatch({
      type: 'admin/getJudgerDataArchive',
      payload: {
        problemId: id,
      },
    }).then((ret) => {
      const filename = /filename=\"(.+?)\"/.exec(ret.headers['content-disposition'])?.[1];
      saveAs(ret.data, filename || `data-${id}.zip`);
    });
  };

  renderFileDetail = () => {
    const { fileDetail } = this.state;
    const maxSize = 100 * 1024;
    if (!fileDetail) {
      return <p>File not found.</p>;
    } else if (fileDetail.isBinary) {
      return <p>Cannot preview because it's a binary file.</p>;
    } else if (fileDetail.content?.length > maxSize) {
      return (
        <p>
          Cannot preview because the file is too large (exceeded{' '}
          {filesize(maxSize, { standard: 'iec' })}).
        </p>
      );
    }
    return (
      <div>
        <h3>
          Content <CopyToClipboardButton text={fileDetail.content} addNewLine />
        </h3>
        <pre className="code-area mt-md">{fileDetail.content}</pre>
      </div>
    );
  };

  render() {
    const { loading, id, dataFileList, problemDetail } = this.props;
    const { selectedPath, fileDetail, fileDetailLoading } = this.state;
    return (
      <PageAnimation>
        <h4 className="mb-md-lg">
          Data of {id} - {problemDetail?.title}
        </h4>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={dataFileList}
                rowKey="path"
                loading={loading}
                pagination={false}
                className="responsive-table"
              >
                <Table.Column
                  title="File"
                  key="File"
                  render={(text, record: any) => {
                    if (record.type === 'directory') {
                      return <span>{record.filename} /</span>;
                    }
                    return (
                      <a onClick={() => this.handleShowFileDetail(record.path)}>
                        {record.filename}
                      </a>
                    );
                  }}
                />
                <Table.Column
                  title="Size"
                  key="Size"
                  align="right"
                  render={(text, record: any) => (
                    <span>
                      {record.type === 'directory'
                        ? ''
                        : filesize(record.size, { standard: 'iec' })}
                    </span>
                  )}
                />
                <Table.Column
                  title="Modified TIme"
                  key="ModifyTime"
                  render={(text, record: any) => (
                    <span>{moment(record.modifyTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                  )}
                />
              </Table>
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <UploadJudgerDataModal problemId={id}>
                <Button block>Upload Archive</Button>
              </UploadJudgerDataModal>
              <Button block className="mt-md" onClick={this.handleDownloadArchive}>
                Download Archive
              </Button>
            </Card>
            <Card bordered={false}>
              <ExtLink
                href={
                  isProd
                    ? `https://github.com/sdutacm/judger-data/tree/master/data/${id}`
                    : `https://github.com/sdutacm/judger-data_test/tree/master/data/${id}`
                }
              >
                <Button block type="default">
                  View Git
                </Button>
              </ExtLink>
            </Card>
          </Col>
        </Row>

        <Drawer
          title={selectedPath}
          width={600}
          onClose={this.handleHideDrawer}
          visible={this.state.drawerVisible}
        >
          <div className="form-drawer-content">
            {fileDetailLoading ? (
              <Spin spinning={fileDetailLoading}>
                <div style={{ height: '320px' }} />
              </Spin>
            ) : (
              <div>
                {fileDetail && (
                  <a className="display-inline-block mb-lg" onClick={this.handleDownload}>
                    Download File
                  </a>
                )}
                {this.renderFileDetail()}
              </div>
            )}
          </div>
        </Drawer>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.admin.problemsHome);
  return {
    id,
    loading: !!state.loading.effects['admin/getProblemDataFiles'],
    dataFileList: state.admin.problemDataFiles[id] || [],
    problemDetail: state.admin.problemDetail[id] || {},
    downloadArchiveLoading: !!state.loading.effects['admin/getJudgerDataArchive'],
  };
}

export default connect(mapStateToProps)(AdminProblemDataList);
