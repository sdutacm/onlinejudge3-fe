import React from 'react';
import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { connect } from 'dva';
import { Form, Input, Select, Modal, Button } from 'antd';
import { FormProps, ReduxProps, RouteLocation } from '@/@types/props';
import msg from '@/utils/msg';
import constants from '@/configs/constants';
import router from 'umi/router';
import pages from '@/configs/pages';
import { numberToAlphabet, urlf } from '@/utils/format';
import tracker from '@/utils/tracker';
import { encode } from 'js-base64';
import { isDeterminedResult } from '@/configs/results';
import { sleep } from '@/utils/misc';
import GenshinStartScreen from './GenshinStartScreen';

export interface Props extends ReduxProps, FormProps {
  problemId: number;
  problemDetail?: IProblem;
  problemIndex?: number;
  contestId?: number;
  competitionId?: number;
  title: string;
  languageConfig: IJudgerLanguageConfigItem[];
  location?: RouteLocation;
}

interface State {
  visible: boolean;
  secondaryLoading: boolean;
  showSpConfirm: boolean;
  solutionId: number;
}

class SubmitSolutionModal extends React.Component<Props, State> {
  private spPollingResultTimer: any;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      secondaryLoading: false,
      showSpConfirm: false,
      solutionId: 0,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'solutions/getLanguageConfig',
      payload: {},
    });
  }

  spGenshinStart = async () => {
    // 白露原
    console.log('Genshin Start!');
    const genshinStartPromise = new Promise((resolve) => {
      setTimeout(() => {
        document.getElementById('full-screen-standalone').style.display = 'block';
        const fss = document.getElementById('full-screen-standalone');
        const prepareExit = () => {
          // this.redirectToSolutionDetail(this.state.solutionId);
        };
        const exitFullScreen = () => {
          document.getElementById('full-screen-standalone').style.display = 'none';
          // @ts-ignore
          if (document.exitFullScreen) {
            // @ts-ignore
            document.exitFullScreen();
            // @ts-ignore
          } else if (document.mozCancelFullScreen) {
            // @ts-ignore
            document.mozCancelFullScreen();
            // @ts-ignore
          } else if (document.webkitExitFullscreen) {
            // @ts-ignore
            document.webkitExitFullscreen();
            // @ts-ignore
          } else if (document.body.msExitFullscreen) {
            // @ts-ignore
            document.body.msExitFullscreen();
          }
          resolve();
        };
        ReactDOM.render(
          <GenshinStartScreen onLastSceneFinished={prepareExit} onFinished={exitFullScreen} />,
          fss,
          () => {
            if (document.body.requestFullscreen) {
              document.body.requestFullscreen();
              // @ts-ignore
            } else if (document.body.mozRequestFullScreen) {
              // @ts-ignore
              document.body.mozRequestFullScreen();
              // @ts-ignore
            } else if (document.body.webkitRequestFullscreen) {
              // @ts-ignore
              document.body.webkitRequestFullscreen();
              // @ts-ignore
            } else if (document.body.msRequestFullscreen) {
              // @ts-ignore
              document.body.msRequestFullscreen();
            }
          },
        );
      }, 500);
    });
    await genshinStartPromise;
  };

  spCallback = async () => {
    this.handleHideModel();
    await this.spGenshinStart();
    this.redirectToSolutionDetail(this.state.solutionId);
  };

  redirectToSolutionDetail = (solutionId: number) => {
    const { contestId, competitionId, location } = this.props;
    // redirect to solution detail page
    const url = contestId
      ? urlf(pages.contests.solutionDetail, {
          param: { id: contestId, sid: solutionId },
        })
      : competitionId
      ? urlf(pages.competitions.solutionDetail, {
          param: { id: competitionId, sid: solutionId },
        })
      : urlf(pages.solutions.detail, {
          param: { id: solutionId },
          query: { from: location.query.from },
        });
    setTimeout(() => router.push(url), constants.modalAnimationDurationFade);
  };

  handleOk = () => {
    const { dispatch, contestId, competitionId, problemDetail } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          secondaryLoading: false,
          showSpConfirm: false,
          solutionId: 0,
        });
        dispatch({
          type: 'solutions/submit',
          payload: {
            ...values,
            codeFormat: 'base64',
            code: encode(values.code),
            contestId,
            competitionId,
          },
        }).then(async (ret) => {
          msg.auto(ret);
          if (ret.success) {
            msg.success('Submit successfully');
            tracker.event({
              category: 'solutions',
              action: 'submit',
              label: values.language,
            });
            const solutionId = ret.data.solutionId;
            if (problemDetail?.spConfig.genshinStart) {
              this.setState({
                secondaryLoading: true,
              });
              let result = 0;
              while (!isDeterminedResult(result)) {
                console.log('polling');
                try {
                  const { data } = await this.props.dispatch({
                    type: 'solutions/getListByIds',
                    payload: {
                      type: 'list',
                      solutionIds: [solutionId],
                    },
                  });
                  if (data.rows[0]) {
                    result = data.rows[0].result;
                    console.log('polling res', result, isDeterminedResult(result));
                  }
                  await sleep(500);
                } catch (e) {
                  console.error('polling error', e);
                }
              }
              console.log('polling done!');
              this.setState({
                secondaryLoading: false,
                showSpConfirm: true,
                solutionId,
              });
            } else {
              this.handleHideModel();
              // @ts-ignore
              window._sockets.judger.emit('subscribe', [solutionId]);
              console.log('subscribe', [solutionId]);
              this.redirectToSolutionDetail(solutionId);
            }
          }
        });
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
    const { children, loading, form, problemId, problemIndex, title, languageConfig } = this.props;
    const { getFieldDecorator } = form;
    const selectedLanguage = form.getFieldValue('language');
    const selectedLanguageConfig = languageConfig.find(
      (lang) => lang.language === selectedLanguage,
    );

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Submit a Solution"
          visible={this.state.visible}
          okText="Submit"
          footer={this.state.showSpConfirm ? null : undefined}
          maskClosable={false}
          closable={!this.state.showSpConfirm}
          confirmLoading={loading || this.state.secondaryLoading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          {this.state.showSpConfirm ? (
            <div style={{ textAlign: 'center' }}>
              Congratulations, your solution has been judged!
              <div className="mt-md">
                <Button onClick={this.spCallback} type="primary">
                  View Result
                </Button>
              </div>
            </div>
          ) : (
            <Form layout="vertical" hideRequiredMark={true}>
              <Form.Item label="Problem">
                {getFieldDecorator('problemId', { initialValue: problemId })(
                  <span className="ant-form-text">
                    {problemIndex ? numberToAlphabet(problemIndex) : problemId} - {title}
                  </span>,
                )}
              </Form.Item>

              <Form.Item label="Language">
                {getFieldDecorator('language', {
                  rules: [{ required: true, message: 'Please select language' }],
                  initialValue: 'C++', // TODO 判断用户默认语言设置
                })(
                  <Select placeholder="Select a language">
                    {languageConfig.map((lang) => (
                      <Select.Option key={lang.language}>{lang.language}</Select.Option>
                    ))}
                  </Select>,
                )}
                <p className="mt-md">{selectedLanguageConfig?.version}</p>
              </Form.Item>

              <Form.Item label="Code">
                {getFieldDecorator('code', {
                  rules: [{ required: true, message: 'Please input code' }],
                })(<Input.TextArea rows={8} />)}
              </Form.Item>
            </Form>
          )}
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['solutions/submit'],
    languageConfig: state.solutions.languageConfig,
  };
}

export default connect(mapStateToProps)(Form.create()(SubmitSolutionModal));
