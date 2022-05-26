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
import { checkPerms } from '@/utils/permission';
import AddFavorite from '@/components/AddFavorite';
import DeleteFavorite from '@/components/DeleteFavorite';
import PageTitle from '@/components/PageTitle';
import { withRouter } from 'react-router';
import { RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import tracker from '@/utils/tracker';
import { connect } from 'dva';
import { ContestTimeStatus } from '@/utils/getSetTimeStatus';
import { EPerm } from '@/common/configs/perm.config';

export interface Props extends RouteProps {
  loading: boolean;
  data: IProblem;
  session: ISessionStatus;
  contestId?: number;
  competitionId?: number;
  contestTimeStatus?: ContestTimeStatus;
  problemIndex?: number;
  favorites: IFavorite[];
  mobile: boolean;
}

const ProblemDetailPage: React.FC<Props> = ({
  loading,
  data,
  session,
  contestId,
  competitionId,
  problemIndex,
  favorites,
  location,
  mobile,
  contestTimeStatus,
}) => {
  if (!loading && !data.problemId) {
    return <NotFound />;
  }
  const solutionsUrl = contestId
    ? urlf(pages.contests.solutions, {
        param: { id: contestId },
        query: { problemId: data.problemId },
      })
    : competitionId
    ? urlf(pages.competitions.solutions, {
        param: { id: competitionId },
        query: { problemId: data.problemId },
      })
    : urlf(pages.solutions.index, {
        query: { problemId: data.problemId, from: location.query.from },
      });
  const topicsUrl =
    contestId || competitionId
      ? ''
      : urlf(pages.topics.index, {
          query: { problemId: data.problemId, from: location.query.from },
        });
  const problemUrl = urlf(pages.problems.detail, { param: { id: data.problemId } });
  const favorite = favorites.find(
    (v) => v.type === 'problem' && v.target && v.target.problemId === data.problemId,
  );
  const renderSubmitButton = () => {
    if (loading) {
      return (
        <Button type="primary" block disabled>
          Submit
        </Button>
      );
    }
    if (!session.loggedIn) {
      return (
        <Button type="primary" block disabled>
          Login to Submit
        </Button>
      );
    }
    if (contestTimeStatus === 'Ended') {
      return (
        <Link
          to={problemUrl}
          onClick={() => {
            tracker.event({
              category: 'contests',
              action: 'toProblem',
            });
          }}
        >
          <Button block>Practice</Button>
        </Link>
      );
    }
    return (
      <SubmissionModal
        problemId={data.problemId}
        title={data.title}
        contestId={contestId}
        competitionId={competitionId}
        problemIndex={problemIndex}
        location={location}
      >
        <Button type="primary" block>
          Submit
        </Button>
      </SubmissionModal>
    );
  };
  const renderSecondaryArea = () => {
    return (
      <PageAnimation>
        <Card bordered={false} className={styles.buttonSeries}>
          {renderSubmitButton()}
          <Link
            to={solutionsUrl}
            onClick={() => {
              tracker.event({
                category: 'problems',
                action: 'toSolutions',
              });
            }}
          >
            <Button block disabled={loading} className={styles.buttonMt}>
              Solutions
            </Button>
          </Link>
          {topicsUrl && (
            <Link
              to={topicsUrl}
              onClick={() => {
                tracker.event({
                  category: 'problems',
                  action: 'toTopics',
                });
              }}
            >
              <Button block disabled={loading} className={styles.buttonMt}>
                Topics
              </Button>
            </Link>
          )}
          {!competitionId && (
            <Button.Group className={styles.buttonMt} style={{ width: '100%' }}>
              {session.loggedIn ? (
                !favorite ? (
                  <AddFavorite type="problem" id={data.problemId}>
                    <Button className="text-ellipsis" style={{ width: '50%' }} title="Star">
                      <Icon type="star" theme="outlined" />
                    </Button>
                  </AddFavorite>
                ) : (
                  <DeleteFavorite favoriteId={favorite.favoriteId}>
                    <Button className="text-ellipsis" style={{ width: '50%' }} title="Star">
                      <Icon type="star" theme="filled" />
                    </Button>
                  </DeleteFavorite>
                )
              ) : (
                <Button disabled className="text-ellipsis" style={{ width: '50%' }} title="Star">
                  <Icon type="star" theme="outlined" />
                </Button>
              )}
              <Button disabled className="text-ellipsis" style={{ width: '50%' }} title="Share">
                <Icon type="share-alt" theme="outlined" />
              </Button>
            </Button.Group>
          )}
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
                {!!data.source?.trim() && (
                  <tr>
                    <td>Source</td>
                    <td>
                      {!contestId && !competitionId ? (
                        <Link
                          to={urlf(pages.problems.index, { query: { source: data.source } })}
                          onClick={() => {
                            tracker.event({
                              category: 'problems',
                              action: 'viewListBySource',
                              label: data.source,
                            });
                          }}
                        >
                          {data.source.trim()}
                        </Link>
                      ) : (
                        <span>{data.source.trim()}</span>
                      )}
                    </td>
                  </tr>
                )}
                {!!data.spj && (
                  <tr>
                    <td>SPJ</td>
                    <td>Yes</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Skeleton>
        </Card>
        {!competitionId && !loading && data.tags && !!data.tags.length && (
          <Card bordered={false}>
            <Form layout="vertical" hideRequiredMark={true} className={gStyles.cardForm}>
              <Form.Item label="Tags">
                <div className="tags">
                  {data.tags.map((tag) => (
                    <Popover
                      key={tag.tagId}
                      content={`${tag.nameEn} / ${tag.nameZhHans} / ${tag.nameZhHant}`}
                    >
                      <Link
                        to={urlf(pages.problems.index, { query: { tagIds: tag.tagId } })}
                        onClick={() => {
                          tracker.event({
                            category: 'problems',
                            action: 'viewListByTag',
                          });
                        }}
                      >
                        <Tag>{tag.nameEn}</Tag>
                      </Link>
                    </Popover>
                  ))}
                </div>
              </Form.Item>
            </Form>
          </Card>
        )}
        {!contestId &&
          !competitionId &&
          !loading &&
          checkPerms(session, EPerm.WriteProblem, EPerm.WriteProblemTag) && (
            <Card bordered={false}>
              <EditProblemPropModal data={data}>
                <Button block>Modify Prop.</Button>
              </EditProblemPropModal>
            </Card>
          )}
      </PageAnimation>
    );
  };

  return (
    <PageTitle
      title={
        Number.isInteger(problemIndex)
          ? `${numberToAlphabet(problemIndex)} - ${data.title}`
          : data.title
      }
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
          {mobile ? renderSecondaryArea() : <Affix offsetTop={84}>{renderSecondaryArea()}</Affix>}
        </Col>
      </Row>
    </PageTitle>
  );
};

function mapStateToProps(state) {
  return {
    mobile: state.global.mobile,
  };
}

export default connect(mapStateToProps)(withRouter(ProblemDetailPage));
