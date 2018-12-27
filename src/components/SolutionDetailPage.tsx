import React from 'react';
import { ReduxProps, RouteProps } from '@/@types/props';
import SolutionTable from '@/components/SolutionTable';
import { Card, Switch, Skeleton } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/styles/hljs';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { hasPermission, isSelf } from '@/utils/permission';
import NotFound from '@/pages/404';
import msg from '@/utils/msg';

interface Props extends ReduxProps {
  loading: boolean;
  data: ISolution;
  changeSharedLoading: boolean;
  session: ISessionStatus;
  contestId?: number;
  problemList?: any[];
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
    const { loading, data, changeSharedLoading, session, dispatch, contestId, problemList } = this.props;
    if (!loading && !data.solutionId) {
      return <NotFound />;
    }
    return (
      <div>
        <Card bordered={false} className="list-card">
          <SolutionTable loading={loading} data={{ rows: loading ? [] : [data] }} dispatch={dispatch}
                         showPagination={false} isDetail contestId={contestId} problemList={problemList} />
        </Card>
        <Card bordered={false}>
          {!loading ?
            <>
              {data.code ?
                <div>
                  <div style={{ height: '32px' }}>
                    {isSelf(session, data.user.userId) &&
                    <div className="float-left">
                      <span>Share Code</span>
                      <Switch checked={data.shared} disabled={loading} loading={changeSharedLoading}
                              onChange={this.onShareChange}
                              className="ml-md" />
                    </div>}
                    <div className="float-right"><CopyToClipboardButton text={data.code} addNewLine={false} /></div>
                  </div>
                  <SyntaxHighlighter language={langsMap4Hljs[data.language]}
                                     showLineNumbers
                                     style={atomOneLight}>{data.code}</SyntaxHighlighter>
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
    );
  }
}

export default SolutionDetailPage;
