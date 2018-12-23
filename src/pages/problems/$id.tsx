import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Skeleton, Button, Affix, Tag, Icon, Popover } from 'antd';
import Link from 'umi/link';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps } from '@/@types/props';
import { urlf } from '@/utils/format';
import ProblemContent from '@/components/ProblemContent';
import styles from './$id.less';
import SubmissionModal from '@/components/SubmitSolutionModal';
import NotFound from '@/pages/404';

interface Props extends ReduxProps, RouteProps {
  data: TypeObject<IProblem>;
}

interface State {
}

class ProblemDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { loading, data: allData, match } = this.props;
    const id = ~~match.params.id;
    const notFound = !loading && !allData[id];
    if (notFound) {
      return <NotFound />;
    }
    const data = allData[id] || {} as IProblem;
    return (
      <Row gutter={16} className="content-view">
        <Col xs={24} md={18} xxl={18}>
          <Card bordered={false}>
            <ProblemContent loading={loading} data={data} />
          </Card>
        </Col>
        <Col xs={24} md={6} xxl={6}>
          <Affix offsetTop={84}>
            <Card bordered={false} className={styles.buttonSeries}>
              {loading
                ? <Button type="primary" block disabled>Submit</Button>
                : <SubmissionModal problemId={data.problemId} title={data.title}>
                  <Button type="primary" block>Submit</Button>
                </SubmissionModal>
              }
              <Link to={urlf(pages.problems.index)}>
                <Button block disabled={loading} className={styles.buttonMt}>Solutions</Button>
              </Link>
              <Link to={urlf(pages.problems.index)}>
                <Button block disabled={loading} className={styles.buttonMt}>Discussions</Button>
              </Link>
              <Button.Group className={styles.buttonMt} style={{ width: '100%' }}>
                <Button disabled={loading} className="text-ellipsis" style={{ width: '50%' }} title="Star">
                  <Icon type="star" theme="outlined" />
                </Button>
                <Button disabled={loading} className="text-ellipsis" style={{ width: '50%' }} title="Share">
                  <Icon type="share-alt" theme="outlined" />
                </Button>
              </Button.Group>
            </Card>
            <Card bordered={false} className={styles.infoBoard}>
              <Skeleton active loading={loading} paragraph={{ rows: 4, width: '100%' }}>
                <table>
                  <tbody>
                  <tr>
                    <td>Time Limit</td>
                    <td>{data.timeLimit || 0} ms</td>
                  </tr>
                  <tr>
                    <td>Mem. Limit</td>
                    <td>{data.memoryLimit || 0} KiB</td>
                  </tr>
                  <tr>
                    <td>Author</td>
                    <td>{data.author}</td>
                  </tr>
                  <tr>
                    <td>Source</td>
                    <td><Link to={urlf(pages.problems.index, { query: { source: data.source } })}>{data.source}</Link>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </Skeleton>
            </Card>
            {!loading && data.tags && !!data.tags.length && <Card bordered={false}>
              <h4 style={{ lineHeight: 1, marginBottom: '12px' }}>Tags</h4>
              {data.tags.map(tag =>
                <Popover key={tag.tagId} content={`${tag.name.en} / ${tag.name.zhHans} / ${tag.name.zhHant}`}>
                  <Link to={urlf(pages.problems.index, { query: { tagIds: tag.tagId } })}><Tag>{tag.name.en}</Tag></Link>
                </Popover>
              )}
            </Card>}
          </Affix>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['problems/getDetail'],
    data: state.problems.detail,
  };
}

export default connect(mapStateToProps)(ProblemDetail);
