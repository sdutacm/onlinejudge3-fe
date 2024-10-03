import React from 'react';
import { ReduxProps } from '@/@types/props';
import { connect } from 'dva';
import SolutionTable from '@/components/SolutionTable';
import { Card, Switch, Skeleton, Icon, Popover, Spin, Button } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight, atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { isSelf } from '@/utils/permission';
import NotFound from '@/pages/404';
import msg from '@/utils/msg';
import PageTitle from '@/components/PageTitle';
import PageAnimation from '@/components/PageAnimation';
import tracker from '@/utils/tracker';
import Explanation from '@/components/Explanation';
import { addPiece } from '@/utils/pasteThenAC';
import ExtLink from './ExtLink';
import { urlf } from '@/utils/format';
import pages from '@/configs/pages';

export interface Props extends ReduxProps {
  loading: boolean;
  data: ISolution;
  changeSharedLoading: boolean;
  session: ISessionStatus;
  contestId?: number;
  competitionId?: number;
  problemList?: any[];
  theme: ISettingsTheme;
  compilationInfoLoading: boolean;
  rating?: boolean;
}

interface State {
  systemTheme: 'light' | 'dark';
  pasteCodeStatus: 'pending' | 'submitting' | 'success' | 'error';
  pasteCodeUrl?: string;
}

const langsMap4Hljs = {
  gcc: 'cpp',
  'g++': 'cpp',
  java: 'java',
  python2: 'python',
  python3: 'python',
  'c#': 'csharp',
  C: 'cpp',
  'C++': 'cpp',
  'C#': 'csharp',
  Java: 'java',
  Python: 'python',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Go: 'go',
  Rust: 'rust',
  Pascal: 'pascal',
  Perl: 'perl',
  Ruby: 'ruby',
  PHP: 'php',
  Haskell: 'haskell',
};

const highlighterLineNumberStyle = {
  float: 'left',
  paddingRight: '20px',
  textAlign: 'right',
  opacity: '.5',
};

class SolutionDetailPage extends React.Component<Props, State> {
  private systemThemeMediaQuery: MediaQueryList;
  private _pastingCodeLock = false;
  private _mounted = false;

  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {
      systemTheme: 'light',
      pasteCodeStatus: 'pending',
      pasteCodeUrl: '',
    };
  }

  systemThemeListener = (e: MediaQueryListEvent) => {
    this.setState({
      systemTheme: e.matches ? 'dark' : 'light',
    });
  };

  componentDidMount() {
    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.setState({
      systemTheme: this.systemThemeMediaQuery.matches ? 'dark' : 'light',
    });
    this.systemThemeMediaQuery.addListener(this.systemThemeListener);
    this._mounted = true;
  }

  componentWillUnmount() {
    this.systemThemeMediaQuery.removeListener(this.systemThemeListener);
    this._mounted = false;
  }

  onShareChange = (checked) => {
    this.props
      .dispatch({
        type: 'solutions/changeShared',
        payload: {
          id: this.props.data.solutionId,
          shared: checked,
        },
      })
      .then((ret) => {
        msg.auto(ret);
        tracker.event({
          category: 'solutions',
          action: 'switchCodeShare',
        });
      });
  };

  getUsedTheme = () => {
    const { theme } = this.props;
    if (theme === 'auto') {
      return this.state.systemTheme;
    }
    return theme;
  };

  handlePasteCodePrimaryClick = () => {
    if (['pending', 'error'].includes(this.state.pasteCodeStatus) && !this._pastingCodeLock) {
      this._pastingCodeLock = true;
      this.setState({
        pasteCodeStatus: 'submitting',
        pasteCodeUrl: '',
      });
      const problemId = this.props.data.problem?.problemId;
      addPiece({
        code: this.props.data.code,
        lang: langsMap4Hljs[this.props.data.language],
        ttl: 2592000, // 1 month
        relLinks: [
          window.location.href,
          problemId &&
            `${window.location.origin}${process.env.BASE}${urlf(pages.problems.detail, {
              param: { id: problemId },
            }).substring(1)}`,
        ].filter(Boolean),
      })
        .then((res) => {
          if (!this._mounted) {
            return;
          }
          this.setState({
            pasteCodeStatus: 'success',
            pasteCodeUrl: res.url,
          });
          this._pastingCodeLock = false;
        })
        .catch((e) => {
          console.error('paste code to paste.then.ac failed:', e);
          if (!this._mounted) {
            return;
          }
          this.setState({
            pasteCodeStatus: 'error',
            pasteCodeUrl: '',
          });
          this._pastingCodeLock = false;
        });
    }
  };

  renderCompilicationInfo = () => {
    const { loading, data, compilationInfoLoading } = this.props;
    if (loading) {
      return null;
    } else if (data.compileInfo) {
      return (
        <Card bordered={false}>
          <div>
            <div style={{ height: '32px' }}>
              <div className="float-left">
                <span>Compile Info</span>
              </div>
              <div className="float-right">
                <CopyToClipboardButton text={data.compileInfo} addNewLine={false} />
              </div>
            </div>
            <SyntaxHighlighter
              language="text"
              showLineNumbers
              style={this.getUsedTheme() === 'light' ? atomOneLight : atomOneDark}
              lineNumberContainerStyle={highlighterLineNumberStyle}
            >
              {data.compileInfo}
            </SyntaxHighlighter>
          </div>
        </Card>
      );
    } else if (compilationInfoLoading) {
      return (
        <Card bordered={false}>
          <div>
            <div style={{ height: '32px' }}>
              <div className="float-left">
                <span>Compile Info</span>
              </div>
            </div>
            <Skeleton active loading={true} title={false} paragraph={{ rows: 3, width: '100%' }} />
          </div>
        </Card>
      );
    }
    return null;
  };

  renderPastCodeContent = () => {
    if (this.state.pasteCodeStatus === 'pending') {
      return null;
    } else if (this.state.pasteCodeStatus === 'submitting') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Spin indicator={<Icon type="loading" spin />} className="mr-md" /> Getting piece...
        </div>
      );
    } else if (this.state.pasteCodeStatus === 'success') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>Share code link!</div>
          <ExtLink href={this.state.pasteCodeUrl}>
            <code>{this.state.pasteCodeUrl}</code>
          </ExtLink>
          <CopyToClipboardButton text={this.state.pasteCodeUrl} addNewLine={false}>
            <Button type="primary" size="small" className="mt-md">
              Copy URL
            </Button>
          </CopyToClipboardButton>
        </div>
      );
    } else if (this.state.pasteCodeStatus === 'error') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>Failed to paste.</div>
          <Button
            type="default"
            size="small"
            className="mt-md"
            onClick={this.handlePasteCodePrimaryClick}
          >
            Retry
          </Button>
        </div>
      );
    }
  };

  renderCodeInside = () => {
    const { loading, data, session, changeSharedLoading } = this.props;
    if (loading) {
      return (
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 6, width: ['26%', '0%', '19%', '50%', '20%', '5%'] }}
        />
      );
    }
    if (!session.loggedIn) {
      return (
        <div>
          <h3 className="warning-text">Login to view more info</h3>
        </div>
      );
    }
    if (typeof data.code !== 'string') {
      return (
        <div>
          <h3 className="warning-text">You do not have permission to view code</h3>
        </div>
      );
    }
    return (
      <div>
        <div style={{ height: '32px' }}>
          {isSelf(session, data.user.userId) ? (
            <div className="float-left">
              <span>
                Make Public
                <Explanation
                  title="Make code public will be disabled in one of these cases"
                  className="ml-sm-md"
                >
                  <div>
                    <ul style={{ paddingInlineStart: '1rem', marginBottom: 0 }}>
                      {/* <li>The user viewing code has not solved the problem</li> */}
                      <li>The problem exists in some running contests</li>
                    </ul>
                  </div>
                </Explanation>
              </span>
              <Switch
                checked={data.shared}
                disabled={loading}
                loading={changeSharedLoading}
                onChange={this.onShareChange}
                className="ml-lg"
              />
            </div>
          ) : (
            <div className="float-left">
              <span>Code</span>
            </div>
          )}
          <div className="float-right">
            <Popover
              placement="bottomRight"
              title="Paste code to paste.then.ac"
              content={this.renderPastCodeContent()}
              trigger="click"
              onClick={this.handlePasteCodePrimaryClick}
            >
              <Icon type="share-alt" theme="outlined" className="pointer mr-md" />
            </Popover>
            <CopyToClipboardButton text={data.code} addNewLine={false} />
          </div>
        </div>
        <SyntaxHighlighter
          language={langsMap4Hljs[data.language]}
          showLineNumbers
          style={this.getUsedTheme() === 'light' ? atomOneLight : atomOneDark}
          lineNumberContainerStyle={highlighterLineNumberStyle}
        >
          {data.code}
        </SyntaxHighlighter>
      </div>
    );
  };

  render() {
    const { loading, data, dispatch, contestId, competitionId, problemList, rating } = this.props;
    if (!loading && !data.solutionId) {
      return <NotFound />;
    }
    return (
      <PageAnimation>
        <PageTitle title="Solution Detail" loading={loading}>
          <div>
            <Card bordered={false} className="list-card">
              <SolutionTable
                loading={loading}
                data={{ rows: loading ? [] : [data] }}
                dispatch={dispatch}
                showPagination={false}
                isDetail
                contestId={contestId}
                competitionId={competitionId}
                problemList={problemList}
                rating={rating}
              />
            </Card>

            {this.renderCompilicationInfo()}

            <Card bordered={false}>{this.renderCodeInside()}</Card>
          </div>
        </PageTitle>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    theme: state.settings.theme,
    compilationInfoLoading: !!state.loading.effects['solutions/getDetailForCompilationInfo'],
  };
}

export default connect(mapStateToProps)(SolutionDetailPage);
