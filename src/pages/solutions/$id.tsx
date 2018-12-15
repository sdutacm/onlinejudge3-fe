import React from 'react';
import { ReduxProps, RouteProps } from '@/@types/props';
import { connect } from 'dva';
import SolutionTable from '@/components/SolutionTable';
import { Card, Switch, Skeleton } from 'antd';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/styles/hljs';
import CopyToClipboardButton from '@/components/CopyToClipboardButton';

interface Props extends RouteProps, ReduxProps {
  data: Solution;
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
    const { loading, data, dispatch } = this.props;
    const dataReady = !loading && data;
    return (
      <div>
        <Card bordered={false} className="list-card">
          <SolutionTable loading={loading} data={{ rows: dataReady ? [data] : [] }} dispatch={dispatch}
                         showPagination={false} isDetail />
        </Card>
        <Card bordered={false}>
          {dataReady ?
            <>
              <div style={{ marginBottom: '12px' }}>
                <span>Share Code <Switch defaultChecked={data.shared} disabled={loading} onChange={this.onShareChange}
                                         className="ml-md" /></span>
                <div className="float-right"><CopyToClipboardButton text={data.code} addNewLine={false} /></div>
              </div>
              {data.code && <SyntaxHighlighter language={langsMap4Hljs[data.language]}
                                               showLineNumbers
                                               style={atomOneLight}>{data.code}</SyntaxHighlighter>}
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
    loading: !!state.loading.effects['solutions/getOne'],
    data: state.solutions.one,
  };
}

export default connect(mapStateToProps)(SolutionDetail);
