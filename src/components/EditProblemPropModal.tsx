import React from 'react';
import { connect } from 'dva';
import { Form, Select, Modal } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';
import AiCornerBadge from '@/components/AiCornerBadge';

export interface Props extends ReduxProps, RouteProps, FormProps {
  data: IProblem;
  tagList: IFullList<ITag>;
}

interface State {
  visible: boolean;
}

type ProblemTagPayload = {
  tagId: number;
  hidden?: boolean;
  isAigc?: boolean;
  aiAuthor?: string;
};

class EditProblemPropModal extends React.Component<Props, State> {
  private difficulty = [
    '未设置难度',
    '1 - 入门（无脑输入输出或 RP 题）',
    '2 - 基础（程设 I、II）',
    '3 - 提高（数据结构、初级算法）',
    '4 - 集训',
    '5 - 省赛铜',
    '6 - 区域赛铜/省赛银',
    '7 - 区域赛银/省赛金',
    '8 - 区域赛金',
    '9 - WF',
    '10 - WF/WTF？',
  ];

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount(): void {
    this.props.dispatch({
      type: 'problems/getTagList',
    });
  }

  getTagFieldValue = (tag: { tagId: number; hidden?: boolean; isAigc?: boolean; aiAuthor?: string }): string => {
    return JSON.stringify(tag);
  };

  parseTagFieldValue = (value: string): Partial<ITag> & { tagId: number } => {
    try {
      const tag = JSON.parse(value);
      return {
        ...tag,
        tagId: Number(tag.tagId),
      };
    } catch (e) {
      return {
        tagId: Number(value),
      };
    }
  };

  getFilteredTagPayload = (tag: Partial<ITag> & { tagId: number }): ProblemTagPayload => {
    const payload: ProblemTagPayload = {
      tagId: Number(tag.tagId),
    };
    if (tag.hidden !== undefined) {
      payload.hidden = tag.hidden;
    }
    if (tag.isAigc !== undefined) {
      payload.isAigc = tag.isAigc;
    }
    if (tag.aiAuthor !== undefined) {
      payload.aiAuthor = tag.aiAuthor;
    }
    return payload;
  };

  getExistingTag = (tagId: number): ITag | undefined => {
    return (this.props.data.tags || []).find(tag => tag.tagId === tagId);
  };

  getTagForDisplay = (tag: ITag): ITag => {
    const existingTag = this.getExistingTag(tag.tagId);
    return existingTag ? { ...tag, ...existingTag } : tag;
  };

  getTagOptions = (): ITag[] => {
    const { data, tagList } = this.props;
    const listedTagIds = tagList.rows.map(tag => tag.tagId);
    const missingSelectedTags = (data.tags || []).filter(tag => !listedTagIds.includes(tag.tagId));
    return [...tagList.rows, ...missingSelectedTags];
  };

  getTagsPayload = (tagValues: string[]): ProblemTagPayload[] => {
    return tagValues.map(value => this.getFilteredTagPayload(this.parseTagFieldValue(value)));
  };

  renderTagLabel = (tag: ITag): React.ReactNode => (
    <span className="problem-tag-select-label">
      <span>{`${tag.nameEn} / ${tag.nameZhHans}`}</span>
      {tag.isAigc && <AiCornerBadge className="ai-corner-badge-inline" />}
    </span>
  );

  handleOk = () => {
    const { dispatch, data: { problemId } } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.difficulty = Number(values.difficulty);
        const tags = this.getTagsPayload(values.tags || []);
        Promise.all([
          dispatch({
            type: 'problems/modifyProblemTags',
            payload: { id: problemId, tags },
          }),
          dispatch({
            type: 'problems/modifyProblemDifficulty',
            payload: { id: problemId, difficulty: values.difficulty },
          }),
        ]).then(rets => {
          msg.auto(rets[0]);
          msg.auto(rets[1]);
          if (rets[0].success && rets[1].success) {
            msg.success('Modify successfully');
            this.handleHideModel();
            dispatch({
              type: 'problems/getDetail',
              payload: {
                id: problemId,
                force: true,
              },
            });
          }
        });
      }
    });
  };

  handleShowModel = e => {
    if (e) {
      e.stopPropagation();
    }
    this.setState({ visible: true });
  };

  handleHideModel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, loading, form, data } = this.props;
    const { getFieldDecorator } = form;
    const tagOptions = this.getTagOptions();

    return (
      <>
        <a onClick={this.handleShowModel}>{children}</a>
        <Modal
          title="Modify Problem Property"
          visible={this.state.visible}
          okText="Submit"
          confirmLoading={loading}
          onOk={this.handleOk}
          onCancel={this.handleHideModel}
        >
          <Form layout="vertical" hideRequiredMark={true}>
            <Form.Item label="Difficulty">
              {getFieldDecorator('difficulty', {
                rules: [{ required: true, message: 'Please select difficulty' }],
                initialValue: data.difficulty.toString(),
              })(
                <Select placeholder="Select a difficulty">
                  {this.difficulty.map((difficulty, index) => (<Select.Option key={index.toString()}>{difficulty}</Select.Option>))}
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Tags">
              {getFieldDecorator('tags', {
                initialValue: (data.tags || []).map(tag => this.getTagFieldValue({ ...tag })),
              })(
                <Select
                  mode="multiple"
                  placeholder="Select problem tags"
                  optionFilterProp="title"
                  optionLabelProp="label"
                >
                  {tagOptions.map(tag => {
                    const tagForDisplay = this.getTagForDisplay(tag);
                    const title = `${tag.nameEn} / ${tag.nameZhHans}`;
                    return (
                      <Select.Option
                        key={tag.tagId.toString()}
                        value={this.getTagFieldValue(
                          this.getExistingTag(tag.tagId) || { tagId: tag.tagId },
                        )}
                        title={title}
                        label={this.renderTagLabel(tagForDisplay)}
                      >
                        {this.renderTagLabel(tagForDisplay)}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['problems/modifyProblemTags'] || !!state.loading.effects['problems/modifyProblemDifficulty'],
    tagList: state.problems.tagList,
  };
}

export default connect(mapStateToProps)(Form.create()(EditProblemPropModal));
