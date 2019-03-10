import React from 'react';
import { connect } from 'dva';
import { Form, Input, Popover, Button } from 'antd';
import { FormProps, ReduxProps } from '@/@types/props';
import msg from '@/utils/msg';

interface Props extends ReduxProps, FormProps {
  type: 'problem' | 'contest';
  id: number;
}

interface State {
  visible: boolean;
}

class AddFavorite extends React.Component<Props, State> {
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

  handleAdd = () => {
    const { dispatch, form, type, id } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const target: any = {};
        switch (type) {
          case 'problem':
            target.problemId = id;
            break;
          case 'contest':
            target.contestId = id;
            break;
        }
        dispatch({
          type: 'favorites/addFavorite',
          payload: {
            type,
            target,
            note: values.note || '',
          },
        }).then(ret => {
          msg.auto(ret);
          if (ret.success) {
            dispatch({
              type: 'favorites/getList',
              payload: {
                force: true,
              },
            });
            msg.success('Added to favorites');
            form.resetFields();
            this.handleHide();
          }
        });
      }
    });
  };

  handleHide = () => {
    this.setState({ visible: false });
  };

  render() {
    const { children, loading, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Popover
        trigger="click"
        placement="bottom"
        title="Add Favorite"
        content={
          <div>
            <Form layout="vertical" hideRequiredMark={true}>
              <Form.Item style={{ marginBottom: '0' }}>
                {getFieldDecorator('note')(
                  <Input.TextArea rows={2} placeholder="Note what you think... (optional)" />
                )}
              </Form.Item>
            </Form>
            <Button type="primary" block loading={loading} onClick={this.handleAdd}>Add</Button>
          </div>}
        visible={this.state.visible}
        onVisibleChange={visible => this.setState({ visible })}
      >
        {children}
      </Popover>
    );
  }
}

function mapStateToProps(state) {
  return {
    loading: !!state.loading.effects['favorites/addFavorite'],
  };
}

export default connect(mapStateToProps)(Form.create()(AddFavorite));
