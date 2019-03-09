import React from 'react';
import { ReduxProps, RouteProps } from '@/@types/props';
import { connect } from 'dva';
import SolutionTable from '@/components/SolutionTable';
import { Card, Switch, Skeleton, Icon, Popover } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { isSelf } from '@/utils/permission';
import NotFound from '@/pages/404';
import msg from '@/utils/msg';
import PageTitle from '@/components/PageTitle';
import PageAnimation from '@/components/PageAnimation';

interface Props extends ReduxProps {
  loading: boolean;
  data: ISolution;
  changeSharedLoading: boolean;
  session: ISessionStatus;
  contestId?: number;
  problemList?: any[];
  theme: ISettingsTheme;
}

interface State {
}

const langsMap4Hljs = {
  'gcc': 'cpp',
  'g++': 'cpp',
  'java': 'java',
  'python2': 'python',
  'python3': 'python',
  'c#': 'cs',
};

const highlighterLineNumberStyle = {
  float: 'left',
  paddingRight: '20px',
  textAlign: 'right',
  opacity: '.5',
};

class SolutionDetailPage extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onShareChange = (checked) => {
    this.props.dispatch({
      type: 'solutions/changeShared',
      payload: {
        id: this.props.data.solutionId,
        shared: checked,
      },
    }).then(ret => {
      msg.auto(ret);
    })
  };

  render() {
    const { loading, data, changeSharedLoading, session, dispatch, contestId, problemList, theme } = this.props;
    if (!loading && !data.solutionId) {
      return <NotFound />;
    }
    return (
      <PageAnimation>
        <PageTitle title="Solution Detail" loading={loading}>
          <div>
            <Card bordered={false} className="list-card">
              <SolutionTable loading={loading} data={{ rows: loading ? [] : [data] }} dispatch={dispatch}
                             showPagination={false} isDetail contestId={contestId} problemList={problemList} />
            </Card>

            {!loading && data.compileInfo &&
            <Card bordered={false}>
              <div>
                <div style={{ height: '32px' }}>
                  <div className="float-left">
                    <span>Compile Info</span>
                  </div>
                  <div className="float-right"><CopyToClipboardButton text={data.compileInfo} addNewLine={false} /></div>
                </div>
                <SyntaxHighlighter language="text"
                                   showLineNumbers
                                   style={theme === 'dark' ? atomOneDark : atomOneLight}
                                   lineNumberContainerStyle={highlighterLineNumberStyle}
                >
                  {data.compileInfo}
                </SyntaxHighlighter>
              </div>
            </Card>}

            <Card bordered={false}>
              {!loading ?
                <>
                  {data.code ?
                    <div>
                      <div style={{ height: '32px' }}>
                        {isSelf(session, data.user.userId) ?
                        <div className="float-left">
                          <span>Share Code
                            <Popover title="Shared code will be disabled in one of these cases" content={<div>
                              <ul style={{ paddingInlineStart: '1rem', marginBottom: 0 }}>
                              <li>The user viewing code has not solved the problem</li>
                              <li>The problem exists in some running contests</li>
                              </ul>
                            </div>}>
                              <Icon type="info-circle" className="info-tips ml-sm-md" />
                            </Popover>
                          </span>
                          <Switch checked={data.shared} disabled={loading} loading={changeSharedLoading}
                                  onChange={this.onShareChange}
                                  className="ml-lg" />
                        </div> :
                        <div className="float-left">
                          <span>Code</span>
                        </div>}
                        <div className="float-right"><CopyToClipboardButton text={data.code} addNewLine={false} /></div>
                      </div>
                      <SyntaxHighlighter language={langsMap4Hljs[data.language]}
                                         showLineNumbers
                                         style={theme === 'dark' ? atomOneDark : atomOneLight}
                                         lineNumberContainerStyle={highlighterLineNumberStyle}
                      >
                        {data.code}
                      </SyntaxHighlighter>
                    </div> :
                    <div>
                      <h3 className="warning-text">You do not have permission to view code</h3>
                    </div>
                  }
                </> :
                <Skeleton active title={false} paragraph={{ rows: 6, width: ['26%', '0%', '19%', '50%', '20%', '5%'] }} />
              }
            </Card>
          </div>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    theme: state.settings.theme,
  };
}

export default connect(mapStateToProps)(SolutionDetailPage);
