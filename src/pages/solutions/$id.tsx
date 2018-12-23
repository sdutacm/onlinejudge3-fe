import React from 'react';
import { ReduxProps, RouteProps } from '@/@types/props';
import { connect } from 'dva';
import SolutionTable from '@/components/SolutionTable';
import { Card, Switch, Skeleton } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/styles/hljs';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';
import { hasPermission } from '@/utils/permission';
import NotFound from '../404';

interface Props extends RouteProps, ReduxProps {
  session: ISession;
  data: TypeObject<ISolution>;
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

class SolutionDetail extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onShareChange = (checked) => {
    console.log(checked);
  };

  render() {
    const { loading, data: allData, session, match, dispatch } = this.props;
    const id = ~~match.params.id;
    const notFound = !loading && !allData[id];
    if (notFound) {
      return <NotFound />;
    }
    const data = allData[id] || {} as ISolution;
    return (
      <div>
        <Card bordered={false} className="list-card">
          <SolutionTable loading={loading} data={{ rows: loading ? [] : [data] }} dispatch={dispatch}
                         showPagination={false} isDetail />
        </Card>
        <Card bordered={false}>
          {!loading ?
            <>
              {data.code ?
                <div>
                  <div style={{ height: '32px' }}>
                    {hasPermission(session, data.user.userId) &&
                    <div className="float-left">
                      <span>Share Code</span>
                      <Switch defaultChecked={data.shared} disabled={loading} onChange={this.onShareChange}
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

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['solutions/getDetail'],
    data: state.solutions.detail,
    session: state.session,
  };
}

export default connect(mapStateToProps)(SolutionDetail);
