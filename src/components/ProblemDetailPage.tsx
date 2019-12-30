import React from 'react';
import { Row, Col, Card, Skeleton, Button, Affix, Tag, Icon, Popover, Form } from 'antd';
import Link from 'umi/link';
import pages from '@/configs/pages';
import { numberToAlphabet, urlf } from '@/utils/format';
import ProblemContent from '@/components/ProblemContent';
import styles from './ProblemDetailPage.less';
import SubmissionModal from '@/components/SubmitSolutionModal';
import gStyles from '@/general.less';
import NotFound from '@/pages/404';
import EditProblemPropModal from '@/components/EditProblemPropModal';
import { isPermissionDog } from '@/utils/permission';
import AddFavorite from '@/components/AddFavorite';
import DeleteFavorite from '@/components/DeleteFavorite';
import PageTitle from '@/components/PageTitle';
import { withRouter } from 'react-router';
import { RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';

export interface Props extends RouteProps {
  loading: boolean;
  data: IProblem;
  session: ISessionStatus;
  contestId?: number;
  problemIndex?: number;
  favorites: IFavorite[];
}

const ProblemDetailPage: React.FC<Props> = ({ loading, data, session, contestId, problemIndex, favorites, location }) => {
  if (!loading && !data.problemId) {
    return <NotFound />;
  }
  const solutionsUrl = contestId
    ? urlf(pages.contests.solutions, { param: { id: contestId }, query: { problemId: data.problemId } })
    : urlf(pages.solutions.index, { query: { problemId: data.problemId, from: location.query.from } });
  const topicsUrl = contestId
    ? ''
    : urlf(pages.topics.index, { query: { problemId: data.problemId, from: location.query.from } });
  const favorite = favorites.find(v => v.type === 'problem' && v.target && v.target.problemId === data.problemId);
  return (
    <PageTitle
      title={Number.isInteger(problemIndex) ? `${numberToAlphabet(problemIndex)} - ${data.title}` : data.title}
      loading={loading}
    >
      <Row gutter={16} className="content-view list-view">
        <Col xs={24} md={18} xxl={18}>
          <PageAnimation>
            <Card bordered={false}>
              <ProblemContent loading={loading} data={data} problemIndex={problemIndex} />
            </Card>
          </PageAnimation>
        </Col>
        <Col xs={24} md={6} xxl={6}>
          <Affix offsetTop={84}>
            <PageAnimation>
              <Card bordered={false} className={styles.buttonSeries}>
                {loading
                  ? <Button type="primary" block disabled>Submit</Button>
                  : (!session.loggedIn
                    ? <Button type="primary" block disabled>Login to Submit</Button>
                    : <SubmissionModal
                      problemId={data.problemId}
                      title={data.title}
                      contestId={contestId}
                      problemIndex={problemIndex}
                      location={location}
                    >
                      <Button type="primary" block>Submit</Button>
                    </SubmissionModal>)
                }
                <Link to={solutionsUrl}>
                  <Button block disabled={loading} className={styles.buttonMt}>Solutions</Button>
                </Link>
                {topicsUrl && <Link to={topicsUrl}>
                  <Button block disabled={loading} className={styles.buttonMt}>Topics</Button>
                </Link>}
                <Button.Group className={styles.buttonMt} style={{ width: '100%' }}>
                  {session.loggedIn ?
                    (!favorite ?
                      <AddFavorite type="problem" id={data.problemId}>
                        <Button className="text-ellipsis" style={{ width: '50%' }} title="Star">
                          <Icon type="star" theme="outlined" />
                        </Button>
                      </AddFavorite> :
                      <DeleteFavorite favoriteId={favorite.favoriteId}>
                        <Button className="text-ellipsis" style={{ width: '50%' }} title="Star">
                          <Icon type="star" theme="filled" />
                        </Button>
                      </DeleteFavorite>) :
                    <Button disabled className="text-ellipsis" style={{ width: '50%' }} title="Star">
                      <Icon type="star" theme="outlined" />
                    </Button>
                  }
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
                        <Popover
                          key={tag.tagId}
                          content={`${tag.name.en} / ${tag.name.zhHans} / ${tag.name.zhHant}`}
                        >
                          <Link to={urlf(pages.problems.index, { query: { tagIds: tag.tagId } })}><Tag>{tag.name.en}</Tag></Link>
                        </Popover>
                      )}
                    </div>
                  </Form.Item>
                </Form>
              </Card>}
              {!contestId && !loading && isPermissionDog(session) &&
              <Card bordered={false}>
                <EditProblemPropModal data={data}>
                  <Button block>Modify Prop.</Button>
                </EditProblemPropModal>
              </Card>}
            </PageAnimation>
          </Affix>
        </Col>
      </Row>
    </PageTitle>
  );
};

export default withRouter(ProblemDetailPage);
