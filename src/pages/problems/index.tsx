/**
 * title: Problems
 */

import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Form, Row, Col, Card, Tag, Popover, Badge } from 'antd';
import router from 'umi/router';
import { Link } from 'react-router-dom';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import FilterCard from '@/components/FilterCard';
import ToDetailCard from '@/components/ToDetailCard';
import gStyles from '@/general.less';
import classNames from 'classnames';
import SolutionResultStats from '@/components/SolutionResultStats';
import PageAnimation from '@/components/PageAnimation';
import tracker from '@/utils/tracker';
import ProblemDifficulty from '@/components/ProblemDifficulty';

export interface Props extends ReduxProps, RouteProps {
  data: IList<IProblem>;
  tagList: IFullList<ITag>;
  problemResultStats: IUserProblemResultStats;
}

interface State {
  filterDropdownVisible: boolean;
  searchTitle: string;
  filtered: boolean;
}

class ProblemList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      filterDropdownVisible: false,
      searchTitle: props.title,
      filtered: !!props.title,
    };
  }

  componentDidMount() {
    this.setStateFromQuery(this.props.location.query);
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.location !== prevProps.location) {
  //     window.scrollTo(0, 0);
  //   }
  // }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.location.query.title !== this.props.location.query.title) {
      this.setStateFromQuery(nextProps.location.query);
    }
  }

  setStateFromQuery(query) {
    this.setState({
      searchTitle: query.title,
      filtered: !!query.title,
    });
  }

  handlePageChange = (page) => {
    router.push({
      pathname: this.props.location.pathname,
      query: { ...this.props.location.query, page },
    });
  };

  onInputChange = (e) => {
    this.setState({ searchTitle: e.target.value });
  };

  handleTableChange = (e) => {
    console.log(e);
  };

  onSearch = () => {
    const { searchTitle } = this.state;
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchTitle,
    });
    router.push({
      pathname: this.props.location.pathname,
      query: { page: 1, title: searchTitle },
    });
  };

  getTagIdsFromQuery = (): number[] => {
    let tagIds: number[] = [];
    const originalTagIds = this.props.location.query.tagIds;
    if (Array.isArray(originalTagIds)) {
      tagIds = originalTagIds.map((v) => +v);
    } else if (typeof originalTagIds === 'string') {
      tagIds = [+originalTagIds];
    }
    return tagIds;
  };

  toggleTag = (tagId: number, replace = false): void => {
    let tagIds = this.getTagIdsFromQuery();
    if (replace) {
      tagIds = [tagId];
    } else {
      const index = tagIds.indexOf(tagId);
      if (~index) {
        tagIds.splice(index, 1);
      } else {
        tagIds.push(tagId);
      }
    }
    tracker.event({
      category: 'problems',
      action: 'toggleTag',
    });
    router.replace({
      pathname: this.props.location.pathname,
      query: {
        ...this.props.location.query,
        tagIds,
        page: 1,
      },
    });
  };

  render() {
    const {
      loading,
      data: { page, count, rows },
      tagList,
      problemResultStats: { acceptedProblemIds, attemptedProblemIds },
    } = this.props;
    const tagIds = this.getTagIdsFromQuery();
    // let searchInput;
    return (
      <PageAnimation>
        <Row gutter={16} className="list-view">
          <Col xs={24} md={18} xxl={20}>
            <Card bordered={false} className="list-card">
              <Table
                dataSource={rows}
                rowKey="problemId"
                loading={loading}
                onChange={this.handleTableChange}
                pagination={false}
                className="responsive-table"
                rowClassName={(record: IProblem) =>
                  classNames(
                    'problem-result-mark-row',
                    { attempted: ~acceptedProblemIds.indexOf(record.problemId) },
                    { accepted: ~attemptedProblemIds.indexOf(record.problemId) },
                  )
                }
              >
                <Table.Column
                  title=""
                  key="Difficulty"
                  width={48}
                  className="text-right"
                  render={(text, record: IProblem) => (
                    <ProblemDifficulty difficulty={record.difficulty} />
                  )}
                />
                <Table.Column
                  title="Title"
                  key="Title"
                  // filterDropdown={(
                  //   <div className={styles.customFilterDropdown}>
                  //     <Input.Search
                  //       ref={ele => {
                  //         searchInput = ele;
                  //       }}
                  //       placeholder=""
                  //       enterButton="Search"
                  //       value={this.state.searchTitle}
                  //       onChange={this.onInputChange}
                  //       onPressEnter={this.onSearch}
                  //       onSearch={this.onSearch}
                  //     />
                  //   </div>
                  // )}
                  // filterIcon={(<Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />)}
                  // filterDropdownVisible={this.state.filterDropdownVisible}
                  // onFilterDropdownVisibleChange={(visible) => {
                  //   this.setState({
                  //     filterDropdownVisible: visible,
                  //   }, () => searchInput && searchInput.focus());
                  // }}
                  render={(text, record: IProblem) => (
                    <div>
                      <Link to={urlf(pages.problems.detail, { param: { id: record.problemId } })}>
                        {record.problemId} - {record.title}
                      </Link>
                      {record.tags.length ? (
                        <div className="float-right">
                          {record.tags.map((tag) => (
                            <Popover
                              key={tag.tagId}
                              content={`${tag.name.en} / ${tag.name.zhHans} / ${tag.name.zhHant}`}
                            >
                              <a onClick={() => this.toggleTag(tag.tagId, true)}>
                                <Tag>{tag.name.en}</Tag>
                              </a>
                            </Popover>
                          ))}
                        </div>
                      ) : (
                        <div className="float-right" style={{ visibility: 'hidden' }}>
                          <Tag>&nbsp;</Tag>
                        </div>
                      )}
                    </div>
                  )}
                />
                <Table.Column
                  title="Stats"
                  key="Statistics"
                  className="no-wrap"
                  render={(text, record: IProblem) => (
                    <SolutionResultStats
                      accepted={record.accepted}
                      submitted={record.submitted}
                      toSolutionsLink={urlf(pages.solutions.index, {
                        query: { problemId: record.problemId },
                      })}
                    />
                  )}
                />
                <Table.Column
                  title="Source"
                  key="Source"
                  render={(text, record: IProblem) => <span>{record.source}</span>}
                />
              </Table>
              <Pagination
                className="ant-table-pagination"
                total={count}
                current={page}
                pageSize={limits.problems.list}
                onChange={this.handlePageChange}
              />
            </Card>
          </Col>
          <Col xs={24} md={6} xxl={4}>
            <Card bordered={false}>
              <ToDetailCard
                label="Go to Problem"
                placeholder="Problem ID"
                toDetailLink={(id) => urlf(pages.problems.detail, { param: { id } })}
              />
            </Card>
            <Card bordered={false}>
              <FilterCard
                fields={[
                  { displayName: 'Title', fieldName: 'title' },
                  { displayName: 'Source', fieldName: 'source' },
                ]}
              />
            </Card>
            <Card bordered={false}>
              <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
                <Form.Item label="Tags">
                  <div className="tags">
                    {tagList.rows.map((tag) => (
                      <Popover
                        key={tag.tagId}
                        content={`${tag.name.en} / ${tag.name.zhHans} / ${tag.name.zhHant}`}
                      >
                        <a onClick={() => this.toggleTag(tag.tagId)}>
                          <Tag color={~tagIds.indexOf(tag.tagId) ? 'blue' : null}>
                            {tag.name.en}
                          </Tag>
                        </a>
                      </Popover>
                    ))}
                  </div>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['problems/getList'],
    data: state.problems.list,
    tagList: state.problems.tagList,
    problemResultStats: state.users.problemResultStats,
  };
}

export default connect(mapStateToProps)(ProblemList);
