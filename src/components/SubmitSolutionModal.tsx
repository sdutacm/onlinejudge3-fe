import React from 'react';
import ReactDOM from 'react-dom';
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
import Results from '@/configs/results/resultsEnum';
import { IProblemSpConfig } from '@/common/interfaces/problem';
import AutoVideoScreen from '@/components/AutoVideoScreen';
import { getSocket } from '@/utils/socket';

export interface Props extends ReduxProps, FormProps {
  problemId: number;
  problemDetail?: IProblem;
  problemIndex?: number;
  problemAlias?: string;
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

  get useSpSecondaryConfirm(): boolean {
    const spConfig = (this.props.problemDetail?.spConfig || {}) as IProblemSpConfig;
    return spConfig.genshinStart || !!spConfig.postACVideo;
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
          // document.getElementById('full-screen-standalone').style.display = 'none';
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

  postACVideo = async () => {
    const spConfig = (this.props.problemDetail.spConfig || {}) as IProblemSpConfig;
    if (!spConfig.postACVideo) {
      return Promise.resolve();
    }
    const postACVideoConfig = spConfig.postACVideo;
    const { url, allowSkip } = postACVideoConfig;
    console.log('Play Post-AC Video:', url);
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        document.getElementById('full-screen-standalone').style.display = 'block';
        const fss = document.getElementById('full-screen-standalone');
        const exitFullScreen = () => {
          // document.getElementById('full-screen-standalone').style.display = 'none';
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
        const onError = (...args) => {
          msg.error('Failed to play video');
          console.error('Failed to play video', ...args);
          exitFullScreen();
        }
        ReactDOM.render(
          <AutoVideoScreen
            url={url}
            allowSkip={allowSkip}
            background="#000"
            onFinished={exitFullScreen}
            onError={onError}
          />,
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
    await promise;
  };

  spCallback = async () => {
    const spConfig = (this.props.problemDetail?.spConfig || {}) as IProblemSpConfig;

    this.handleHideModel();

    if (spConfig.genshinStart) {
      await this.spGenshinStart();
    } else if (spConfig.postACVideo) {
      await this.postACVideo();
    }

    this.redirectToSolutionDetail(this.state.solutionId);
    setTimeout(() => {
      document.getElementById('full-screen-standalone').style.display = 'none';
      ReactDOM.unmountComponentAtNode(document.getElementById('full-screen-standalone'));
    }, 1000);

    if (spConfig.genshinStartPostOpenUrl) {
      // it will fail if popup is not allowed in most of modern browsers
      window.open(
        (this.props.problemDetail.spConfig as IProblemSpConfig).genshinStartPostOpenUrl,
        '_blank',
      );
    }
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
            if (this.useSpSecondaryConfirm) {
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
              if (result === Results.AC) {
                this.setState({
                  secondaryLoading: false,
                  showSpConfirm: true,
                  solutionId,
                });
              } else {
                this.setState({
                  secondaryLoading: false,
                  showSpConfirm: false,
                  solutionId,
                });
                this.handleHideModel();
                this.redirectToSolutionDetail(solutionId);
              }
            } else {
              this.handleHideModel();
              getSocket('judger')!.emit('subscribe', [solutionId]);
              console.log('[socket.judger] subscribe', [solutionId]);
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
    const { children, loading, form, problemId, problemIndex, problemAlias, title, languageConfig } = this.props;
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
          closable={!this.state.showSpConfirm && !this.state.secondaryLoading}
          confirmLoading={loading || this.state.secondaryLoading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
          cancelButtonProps={{ disabled: this.state.secondaryLoading }}
        >
          {this.state.showSpConfirm ? (
            <div style={{ textAlign: 'center' }}>
              Your solution has been judged!
              <div className="mt-md">
                <Button onClick={this.spCallback} type="primary">
                  Confirm
                </Button>
              </div>
            </div>
          ) : (
            <Form layout="vertical" hideRequiredMark={true}>
              <Form.Item label="Problem">
                {getFieldDecorator('problemId', { initialValue: problemId })(
                  <span className="ant-form-text">
                    {problemAlias ? problemAlias : problemIndex ? numberToAlphabet(problemIndex) : problemId} - {title}
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
