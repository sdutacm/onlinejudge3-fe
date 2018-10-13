import React from 'react';
import { connect } from 'dva';
import { Table, Pagination, Popover, Input, Icon } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';
import moment from 'moment';
import classNames from 'classnames';
import TimeStatusBadge from './components/TimeStatusBadge';
import limits from '@/configs/limits';
import pages from '@/configs/pages';
import gStyles from '@/general.less';
import styles from './index.less';
import { ReduxProps, RouteProps } from '@/@types/props';

interface Props extends ReduxProps, RouteProps {
  data: any;
  page: number;
  total: number;
  title: string;
  serverTime: Date;
}

interface State {
  filterDropdownVisible: boolean;
  searchTitle: string;
  filtered: boolean;
}

class ContestACMList extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      filterDropdownVisible: false,
      searchTitle: props.title,
      filtered: !!props.title,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.title !== this.props.title) {
      this.setState({
        searchTitle: nextProps.title,
        filtered: !!nextProps.title,
      });
    }
  }

  handleChangePage = page => {
    const { title } = this.props;
    router.push({
      pathname: pages.contest.index,
      query: { page, title },
    });
  };

  onInputChange = (e) => {
    this.setState({ searchTitle: e.target.value });
  };

  handleChangeTable = (e) => {
    console.log(e);
  };

  onSearch = () => {
    const { searchTitle } = this.state;
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchTitle,
    });
    router.push({
      pathname: pages.contest.index,
      query: { page: 1, title: searchTitle },
    });
  };

  render() {
    const { data, loading, page, total, serverTime } = this.props;
    let searchInput;
    return (
      <div>
        <Table dataSource={data}
               rowKey={(record: any) => record.id}
               loading={loading}
               onChange={this.handleChangeTable}
               pagination={false}
               className={styles.responsiveTable}
        >
          <Table.Column
            title="Title"
            key="title"
            filterDropdown={(
              <div className={styles.customFilterDropdown}>
                <Input.Search
                  ref={ele => { searchInput = ele }}
                  placeholder=""
                  enterButton="Search"
                  value={this.state.searchTitle}
                  onChange={this.onInputChange}
                  onPressEnter={this.onSearch}
                  onSearch={this.onSearch}
                />
              </div>
            )}
            filterIcon={(<Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />)}
            filterDropdownVisible={this.state.filterDropdownVisible}
            onFilterDropdownVisibleChange={(visible) => {
              this.setState({
                filterDropdownVisible: visible,
              }, () => searchInput && searchInput.focus());
            }}
            render={(text, record: any) => (
              <Link to={`${pages.contest.index}/${record.id}`}>{record.title}</Link>
            )}
          />
          <Table.Column
            title="Time"
            key="time"
            render={(text, record: any) => (
              <Popover content={(
                <table>
                  <tbody>
                  <tr>
                    <td className={classNames(gStyles.textRight, gStyles.textBold)}>Start:</td>
                    <td>{moment(record.started_at).format('YYYY-MM-DD HH:mm:ss Z')} ({moment(record.started_at).from(serverTime)})</td>
                  </tr>
                  <tr>
                    <td className={classNames(gStyles.textRight, gStyles.textBold)}>End:</td>
                    <td>{moment(record.ended_at).format('YYYY-MM-DD HH:mm:ss Z')} ({moment(record.ended_at).from(serverTime)})</td>
                  </tr>
                  </tbody>
                </table>
              )}>
                <span>{moment(record.started_at).format('YYYY-MM-DD HH:mm')} ~ {moment(record.ended_at).format('YYYY-MM-DD HH:mm')}</span>
              </Popover>
            )}
          />
          <Table.Column
            title="Status"
            key="status"
            render={(text, record: any) => (
              <TimeStatusBadge start={record.started_at} end={record.ended_at} cur={serverTime} />
            )}
          >
          </Table.Column>
        </Table>
        <Pagination
          className="ant-table-pagination"
          total={total}
          current={page}
          pageSize={limits.contest.acm.list}
          onChange={this.handleChangePage}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { data, page, total, title } = state.contest_acm.list;
  const serverTime = state.contest_acm.serverTime;
  return {
    loading: !!state.loading.effects['contest_acm/getList'] || !!state.loading.effects['contest_acm/reloadList'],
    data,
    page,
    total,
    title,
    serverTime,
  };
}

export default connect(mapStateToProps)(ContestACMList);
