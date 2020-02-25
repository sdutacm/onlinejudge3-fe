import React from 'react';
import { connect } from 'dva';
import { Form, Modal, Collapse, Divider } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';
import ExcelSelectParser from './ExcelSelectParser';
import staticUrls from '@/configs/staticUrls';
import router from 'umi/router';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';
import constants from '@/configs/constants';

export interface Props extends ReduxProps, FormProps {
  type: 'add' | 'update';
  setId?: number;
  addLoading: boolean;
  updateLoading: boolean;
}

interface State {
  visible: boolean;
  data: Pick<ISetStandard, 'title' | 'description' | 'type' | 'props'> | null;
}

class ImportSetModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: null,
    };
  }

  handleExcelChange = (aoa: any[][]) => {
    const title = aoa[0][0].trim();
    const description = aoa[0][1] || '';
    const sections: ISetPropsTypeStandard['sections'] = [];
    if (!title) {
      this.setState({
        data: null,
      });
      return;
    }
    let r = 1;
    let section: any;
    while (r < aoa.length) {
      if (aoa[r][0] && `${aoa[r][0]}`.startsWith('#')) {
        section = {};
        section.title = `${aoa[r][0]}`.split('#')[1].trim();
        aoa[r][1] && (section.description = `${aoa[r][1]}`);
        section.problems = [];
        sections.push(section);
      } else if (+aoa[r][0] > 0 && Number.isSafeInteger(+aoa[r][0])) {
        const problem: any = {
          problemId: +aoa[r][0],
        };
        aoa[r][1] && (problem.title = `${aoa[r][1]}`.trim());
        section.problems.push(problem);
      } else {
        this.setState({
          data: null,
        });
        return;
      }
      r++;
    }
    this.setState({
      data: {
        title,
        description,
        type: 'standard',
        props: {
          sections,
        },
      },
    });
  };

  handleOk = async () => {
    const { dispatch, type, setId } = this.props;
    const { data } = this.state;
    if (type === 'add') {
      const ret: IApiResponse<{ setId: number }> = await dispatch({
        type: 'sets/addSet',
        payload: {
          data,
        },
      });
      msg.auto(ret);
      if (ret.success) {
        tracker.event({
          category: 'sets',
          action: 'addSet',
        });
        msg.success('Import successfully');
        this.handleHideModel();
        dispatch({
          type: 'sets/clearList',
          payload: {},
        });
        setTimeout(
          () => router.push(urlf(pages.sets.detail, { param: { id: ret.data.setId } })),
          constants.modalAnimationDurationFade,
        );
      }
    } else {
      const ret: IApiResponse<{ setId: number }> = await dispatch({
        type: 'sets/updateSet',
        payload: {
          id: setId,
          data,
        },
      });
      msg.auto(ret);
      if (ret.success) {
        tracker.event({
          category: 'sets',
          action: 'updateSet',
        });
        msg.success('Update successfully');
        this.handleHideModel();
        dispatch({
          type: 'sets/clearList',
          payload: {},
        });
        dispatch({
          type: 'sets/getDetail',
          payload: {
            id: setId,
            force: true,
          },
        });
      }
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
    const { children, form, type, addLoading, updateLoading } = this.props;
    const { getFieldDecorator } = form;
    const { data } = this.state;
    const loading = type === 'add' ? addLoading : updateLoading;

    return (
      <>
        <span onClick={this.handleShowModel}>{children}</span>
        <Modal
          title={type === 'add' ? 'Import to Generate Set' : 'Import to Update Set'}
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
                templateUrl={staticUrls.templates.set}
                onChange={this.handleExcelChange}
              />
            </Form.Item>
            {data ? (
              <Form.Item label="Preview" className="mb-none">
                <span className="ant-form-text">Set title: {data.title}</span>
                {data.description ? (
                  <span className="ant-form-text">Set description: {data.description}</span>
                ) : null}
                <Collapse bordered={false} className="single-panel">
                  <Collapse.Panel
                    key={`${Date.now()}`}
                    header={`${data.props.sections.length} section(s)`}
                  >
                    {data.props.sections.map((section, index) => (
                      <div key={section.title}>
                        {index > 0 && <Divider />}
                        <h4>
                          Section {index + 1}: {section.title}
                        </h4>
                        {section.description ? <div>{section.description}</div> : null}
                        <div className="mt-md">
                          {section.problems.map((p) => (
                            <div key={p.problemId}>
                              <span>{p.problemId}</span>
                              <span className="ml-md">{p.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
  return {
    addLoading: !!state.loading.effects['sets/addSet'],
    updateLoading: !!state.loading.effects['sets/updateSet'],
  };
}

export default connect(mapStateToProps)(Form.create()(ImportSetModal));
