import React from 'react';
import { connect } from 'dva';
import { List, Input, Tag, Button, Icon, Form } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import pages from '@/configs/pages';
import { getPathParams, getPathParamId } from '@/utils/getPathParams';
import { alphabetToNumber, numberToAlphabet, urlf } from '@/utils/format';
import { isEqual } from 'lodash';
import { Link } from 'react-router-dom';
import styles from './IdeaNotes.less';
import { resultsMap } from '@/configs/results';
import msg from '@/utils/msg';
import { Codes } from '@/configs/codes/codes';
import TimeBar from '@/components/TimeBar';
import classNames from 'classnames';

interface Props extends ReduxProps, RouteProps, FormProps {
  notes: IFullList<INote>;
  contestProblems: IFullList<IProblem>;
  onLinkClick(): void;
}

class IdeaNotes extends React.Component<Props> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

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

  addNote = () => {
    const { dispatch, form } = this.props;
    const urlData = this.analyzeUrl();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const postData = {
          content: values.content,
          ...urlData,
        };
        dispatch({
          type: 'notes/addNote',
          payload: postData,
        }).then(ret => {
          if (ret.code === Codes.R_NOTES_NO_PERMISSION) {
            msg.error('Save Failed. You don\'t have view permission in this page')
          }
          else {
            msg.auto(ret);
          }
          if (ret.success) {
            dispatch({
              type: 'notes/getList',
              payload: {
                force: true,
              },
            });
            msg.success('Idea Saved');
            form.resetFields();
          }
        });
      }
    });
  };

  deleteNote = (noteId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'notes/deleteNote',
      payload: {
        id: noteId,
      },
    }).then(ret => {
      msg.auto(ret);
      if (ret.success) {
        dispatch({
          type: 'notes/getList',
          payload: {
            force: true,
          },
        });
        msg.success('Deleted');
      }
    });
  };

  render() {
    const { notes, onLinkClick, loading, form: { getFieldDecorator } } = this.props;
    return (
      <div className={styles.container}>
        <Form layout="vertical" hideRequiredMark={true}>
          <Form.Item style={{ marginBottom: '0' }}>
            {getFieldDecorator('content', {
              rules: [{ required: true, message: 'Please input idea' }],
            })(
              <Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} placeholder="Type new idea..." />
            )}
          </Form.Item>
        </Form>
        <Button type="primary"
                block
                style={{ marginTop: '4px', marginBottom: '12px' }}
                onClick={this.addNote}
                loading={loading}
        >
          Save <Icon type="bulb" />
        </Button>
        <List
          itemLayout="horizontal"
          size="small"
          dataSource={notes.rows || []}
          renderItem={(item: INote) => {
            let url = '';
            let title = '';
            switch (item.type) {
              case 'problem':
                const problemContest = item.target.contest;
                if (problemContest) {
                  const maxContestTitleLength = 20;
                  const contestTitle = problemContest.title.length > maxContestTitleLength ?
                    problemContest.title.substr(0, maxContestTitleLength) + '...' :
                    problemContest.title;
                  url = urlf(pages.contests.problemDetail, {
                    param: {
                      id: problemContest.contestId,
                      index: numberToAlphabet(problemContest.problemIndex),
                    },
                  });
                  title = `${contestTitle} / ${numberToAlphabet(problemContest.problemIndex)} - ${item.target.title}`;
                }
                else {
                  url = urlf(pages.problems.detail, {
                    param: {
                      id: item.target.problemId,
                    },
                  });
                  title = item.target.title;
                }
                break;
              case 'contest':
                url = urlf(pages.contests.overview, {
                  param: {
                    id: item.target.contestId,
                  },
                });
                title = item.target.title;
                break;
              case 'solution':
                const solutionProblem = item.target.problem;
                const solutionContest = item.target.contest;
                const resultInfo = resultsMap[item.target.result] || {};
                if (solutionContest) {
                  const maxContestTitleLength = 18;
                  const contestTitle = solutionContest.title.length > maxContestTitleLength ?
                    solutionContest.title.substr(0, maxContestTitleLength) + '...' :
                    solutionContest.title;
                  url = urlf(pages.contests.solutionDetail, {
                    param: {
                      id: solutionContest.contestId,
                      sid: item.target.solutionId,
                    },
                  });
                  title = `${resultInfo.shortName} / ${contestTitle} / ${numberToAlphabet(solutionContest.problemIndex)} - ${solutionProblem.title}`;
                }
                else {
                  url = urlf(pages.solutions.detail, {
                    param: {
                      id: item.target.solutionId,
                    },
                  });
                  title = `${resultInfo.shortName} / ${solutionProblem.title}`;
                }
                break;
            }
            return (
              <List.Item className={styles.item}>
                <List.Item.Meta
                  title={<pre>{item.content}</pre>}
                  description={<div>
                    {title ? <Link to={url} onClick={onLinkClick}><Tag>{title}</Tag></Link> : null}
                    <p className={styles.footer}>
                      <TimeBar time={item.createdAt * 1000} />
                      <a className={classNames('ml-md-lg', styles.delete)}
                         onClick={() => this.deleteNote(item.noteId)}
                      >Delete</a>
                    </p>
                  </div>}
                />
              </List.Item>
            );
          }}
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
    loading: !!state.loading.effects['notes/addNote'],
    contestProblems: state.contests.problems[contestId] || {},
  };
}

export default connect(mapStateToProps)(Form.create()(IdeaNotes));
