import React from 'react';
import { connect } from 'dva';
import { List, Input, Tag } from 'antd';
import { RouteProps } from '@/@types/props';
import pages from '@/configs/pages';
import { getPathParams, getPathParamId } from '@/utils/getPathParams';
import { alphabetToNumber } from '@/utils/format';

interface Props extends RouteProps {
  notes: IFullList<INote>;
  contestProblems: IFullList<IProblem>;
}

interface State {
}

class IdeaNotes extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  ideaNotesList = [
    { content: '这货可能是个 dp', tmpTag: (<Tag><a>cyk的游戏</a></Tag>), time: 1539733234 },
    { content: '赛时漏了 12 点的情况，回头补一下', tmpTag: (<Tag><a>2018 年寒假集训选拔 / A - 时间格式转换</a></Tag>), time: 1539733234 },
  ];

  analyzeUrl: () => INoteReq = () => {
    const { location, location: { pathname } } = this.props;
    let id;
    let params;
    if ((id = getPathParamId(pathname, pages.problems.detail))) { // problem
      return {
        type: 'problem',
        target: {
          problemId: id,
        },
      };
    }
    else if ((params = getPathParams(pathname, pages.contests.problemDetail))) { // problem in contest
      const index = alphabetToNumber(params.index);
      const rows = this.props.contestProblems.rows;
      const problem = (rows && rows[index]) || {} as IProblem;
      return {
        type: 'problem',
        target: {
          problemId: problem.problemId,
          contestId: ~~params.id,
        },
      };
    }
    else if ((id = getPathParamId(pathname, pages.solutions.detail))) { // solution
      return {
        type: 'solution',
        target: {
          solutionId: id,
        },
      };
    }
    else if ((params = getPathParams(pathname, pages.contests.solutionDetail))) { // solution in contest
      return {
        type: 'solution',
        target: {
          solutionId: ~~params.sid,
        },
      };
    }
    else if ((id = getPathParamId(pathname, pages.contests.overview)) ||
      (id = getPathParamId(pathname, pages.contests.solutions)) ||
      (id = getPathParamId(pathname, pages.contests.ranklist))) { // contest
      return {
        type: 'contest',
        target: {
          contestId: id,
        },
      };
    }

    return {
      type: '',
      target: {
        url: window.location.href,
        location: {
          pathname: pathname,
          search: location.search,
          query: location.query,
          hash: location.hash,
        },
      },
    };
  };

  render() {
    const { notes } = this.props;
    const x = this.analyzeUrl();
    console.log('analyzeUrl', x.type, x.target);
    return (
      <div>
        <Input.TextArea placeholder="Type new idea..." autosize={{ minRows: 2, maxRows: 6 }} />
        <List
          itemLayout="horizontal"
          size="small"
          // loadMore={() => console.log('more')}
          dataSource={this.ideaNotesList}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<a>{item.content}</a>}
                description={item.tmpTag}
              />
            </List.Item>
          )}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const contestId = getPathParamId(state.routing.location.pathname, pages.contests.home);
  return {
    location: state.routing.location,
    notes: state.notes.list,
    contestProblems: state.contests.problems[contestId] || {},
  };
}

export default connect(mapStateToProps)(IdeaNotes);
