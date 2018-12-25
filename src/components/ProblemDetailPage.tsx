import React from 'react';
import { Row, Col, Card, Skeleton, Button, Affix, Tag, Icon, Popover, Form } from 'antd';
import Link from 'umi/link';
import pages from '@/configs/pages';
import { urlf } from '@/utils/format';
import ProblemContent from '@/components/ProblemContent';
import styles from './ProblemPage.less';
import SubmissionModal from '@/components/SubmitSolutionModal';
import gStyles from '@/general.less';
import NotFound from '@/pages/404';

interface Props {
  loading: boolean;
  data: IProblem;
  session: ISessionStatus;
  contestId?: number;
  problemIndex?: number;
}

const ProblemDetailPage: React.StatelessComponent<Props> = ({ loading, data, session, contestId, problemIndex }) => {
  if (!loading && !data.problemId) {
    return <NotFound />;
  }
  const solutionsUrl = contestId
    ? urlf(pages.contests.solutions, { param: { id: contestId }, query: { problemId: data.problemId } })
    : urlf(pages.solutions.index, { query: { problemId: data.problemId } });
  return (
    <Row gutter={16} className="content-view">
      <Col xs={24} md={18} xxl={18}>
        <Card bordered={false}>
          <ProblemContent loading={loading} data={data} problemIndex={problemIndex} />
        </Card>
      </Col>
      <Col xs={24} md={6} xxl={6}>
        <Affix offsetTop={84}>
          <Card bordered={false} className={styles.buttonSeries}>
            {loading
              ? <Button type="primary" block disabled>Submit</Button>
              : (!session.loggedIn
                ? <Button type="primary" block disabled>Login to Submit</Button>
                : <SubmissionModal problemId={data.problemId} title={data.title}
                                   contestId={contestId} problemIndex={problemIndex}>
                  <Button type="primary" block>Submit</Button>
                </SubmissionModal>)
            }
            <Link to={solutionsUrl}>
              <Button block disabled={loading} className={styles.buttonMt}>Solutions</Button>
            </Link>
            {/*<Link to={urlf(pages.problems.index)}>*/}
              {/*<Button block disabled={loading} className={styles.buttonMt}>Discussions</Button>*/}
            {/*</Link>*/}
            <Button.Group className={styles.buttonMt} style={{ width: '100%' }}>
              <Button disabled className="text-ellipsis" style={{ width: '50%' }} title="Star">
                <Icon type="star" theme="outlined" />
              </Button>
              <Button disabled className="text-ellipsis" style={{ width: '50%' }} title="Share">
                <Icon type="share-alt" theme="outlined" />
              </Button>
            </Button.Group>
          </Card>
          <Card bordered={false} className={styles.infoBoard}>
            <Skeleton active loading={loading} paragraph={{ rows: 3, width: '100%' }}>
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
                {!!data.source &&
                <tr>
                  <td>Source</td>
                  <td>
                    {!contestId
                      ? <Link to={urlf(pages.problems.index, { query: { source: data.source } })}>{data.source}</Link>
                      : <span>{data.source}</span>
                    }
                  </td>
                </tr>}
                </tbody>
              </table>
            </Skeleton>
          </Card>
          {!loading && data.tags && !!data.tags.length && <Card bordered={false}>
            <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
              <Form.Item label="Tags">
                <div className="tags">
                  {data.tags.map(tag =>
                    <Popover key={tag.tagId} content={`${tag.name.en} / ${tag.name.zhHans} / ${tag.name.zhHant}`}>
                      <Link to={urlf(pages.problems.index, { query: { tagIds: tag.tagId } })}><Tag>{tag.name.en}</Tag></Link>
                    </Popover>
                  )}
                </div>
              </Form.Item>
            </Form>
          </Card>}
        </Affix>
      </Col>
    </Row>
  );
};

export default ProblemDetailPage;
