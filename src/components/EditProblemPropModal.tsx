import React from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Modal } from 'antd';
import { FormProps, ReduxProps, RouteProps } from '@/@types/props';
import msg from '@/utils/msg';

interface Props extends ReduxProps, RouteProps, FormProps {
  data: IProblem;
  tagList: IFullList<ITag>;
}

interface State {
  visible: boolean;
}

class EditProblemPropModal extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  difficulty = [
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

  componentDidMount(): void {
    this.props.dispatch({
      type: 'problems/getTagList',
    });
  }

  handleOk = () => {
    const { dispatch, data: { problemId } } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.difficulty = +values.difficulty;
        values.tagIds = values.tagIds.map(v => +v);
        Promise.all([
          dispatch({
            type: 'problems/modifyProblemTags',
            payload: { id: problemId, tagIds: values.tagIds },
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
    const { children, loading, form, data, tagList } = this.props;
    const { getFieldDecorator } = form;

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
              {getFieldDecorator('tagIds', {
                initialValue: data.tags.map(tag => tag.tagId.toString()),
              })(
                <Select mode="multiple" placeholder="Select problem tags">
                  {tagList.rows.map(tag => (<Select.Option key={tag.tagId.toString()}>{tag.name.en} / {tag.name.zhHans}</Select.Option>))}
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
