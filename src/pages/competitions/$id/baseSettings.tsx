/**
 * title: Competition Base Settings
 */

import React from 'react';
import { connect } from 'dva';
import pages from '@/configs/pages';
import { ReduxProps, RouteProps, FormProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { getPathParamId } from '@/utils/getPathParams';
import { ICompetition, ICompetitionSettings } from '@/common/interfaces/competition';
import { Button, Form } from 'antd';
import GeneralForm, { IGeneralFormItem } from '@/components/GeneralForm';
import tracker from '@/utils/tracker';
import msg from '@/utils/msg';
import PageLoading from '@/components/PageLoading';

export interface Props extends ReduxProps, RouteProps, FormProps {
  id: number;
  detail: ICompetition;
  settings: ICompetitionSettings;
  submitLoading: boolean;
}

interface State {}

class CompetitionBaseSettings extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getContestDetailFormItems() {
    const { detail, settings } = this.props;
    const items: IGeneralFormItem[] = [
      {
        name: 'Title',
        field: 'title',
        component: 'input',
        initialValue: detail?.title || '',
        rules: [{ required: true, message: 'Please input the field' }],
      },
      {
        name: 'Start at',
        field: 'startAt',
        component: 'datetime',
        initialValue: detail?.startAt || undefined,
        rules: [{ required: true }],
      },
      {
        name: 'End at',
        field: 'endAt',
        component: 'datetime',
        initialValue: detail?.endAt || undefined,
        rules: [{ required: true }],
      },
      {
        name: 'Register Start at',
        field: 'registerStartAt',
        component: 'datetime',
        initialValue: detail?.registerStartAt || undefined,
        rules: [],
      },
      {
        name: 'Register End at',
        field: 'registerEndAt',
        component: 'datetime',
        initialValue: detail?.registerEndAt || undefined,
        rules: [],
      },
      {
        name: 'Team Competition',
        field: 'isTeam',
        component: 'select',
        initialValue: `${!!(detail?.isTeam ?? false)}`,
        options: [
          {
            value: true,
            name: 'Yes',
          },
          {
            value: false,
            name: 'No',
          },
        ],
        rules: [{ required: true }],
      },
      {
        name: 'Introduction',
        field: 'introduction',
        component: 'richtext',
        initialValue: detail?.introduction || '',
        rules: [],
        contentStyle: { height: '250px' },
        uploadTarget: 'asset',
        uploadOption: {
          prefix: 'competition',
          maxSize: 32,
        },
      },
      {
        name: 'Hidden',
        field: 'hidden',
        component: 'select',
        initialValue: `${!!(detail?.hidden ?? false)}`,
        options: [
          {
            value: true,
            name: 'Yes',
          },
          {
            value: false,
            name: 'No',
          },
        ],
        rules: [{ required: true }],
      },
      {
        name: 'Frozen Length (unit: second)',
        field: 'frozenLength',
        component: 'input',
        initialValue: settings?.frozenLength || 0,
        placeholder: 'Seconds to frozen',
        rules: [],
      },
      {
        name: 'External Ranklist URL',
        field: 'externalRanklistUrl',
        component: 'input',
        initialValue: settings?.externalRanklistUrl || '',
        rules: [],
      },
    ];
    return items;
  }

  getHandledDetailDataFromForm(values) {
    return {
      title: values.title,
      startAt: values.startAt.toISOString(),
      endAt: values.endAt.toISOString(),
      registerStartAt: values.registerStartAt ? values.registerStartAt.toISOString() : null,
      registerEndAt: values.registerEndAt ? values.registerEndAt.toISOString() : null,
      isTeam: values.isTeam === 'true',
      introduction: values.introduction.toHTML(),
      hidden: values.hidden === 'true',
    };
  }

  getHandledSettingsDataFromForm(values) {
    return {
      frozenLength: +values.frozenLength || 0,
      externalRanklistUrl: values.externalRanklistUrl || '',
    };
  }

  handleSubmit = () => {
    const { id, form } = this.props;
    tracker.event({
      category: 'competition',
      action: 'updateDetailAndSettings',
    });
    form.validateFields((err, values) => {
      if (!err) {
        const detailData = this.getHandledDetailDataFromForm(values);
        const settingsData = this.getHandledSettingsDataFromForm(values);
        return Promise.all([
          this.props.dispatch({
            type: 'competitions/updateCompetitionDetail',
            payload: {
              id,
              data: detailData,
            },
          }),
          this.props.dispatch({
            type: 'competitions/updateSettings',
            payload: {
              id,
              data: settingsData,
            },
          }),
        ]).then(([detailRet, settingsRet]) => {
          msg.auto(detailRet);
          msg.auto(settingsRet);
          if (detailRet.success && settingsRet.success) {
            msg.success('Save success');
            this.props.dispatch({
              type: 'competitions/getDetail',
              payload: {
                id,
                force: true,
              },
            });
            this.props.dispatch({
              type: 'competitions/getSettings',
              payload: {
                id,
                force: true,
              },
            });
          }
        });
      }
    });
  };

  render() {
    const { loading, submitLoading, form } = this.props;
    if (loading) {
      return <PageLoading />
    }

    return (
      <PageAnimation>
        <h3 className="mb-xl">Base Settings</h3>
        <GeneralForm form={form} items={this.getContestDetailFormItems()} />
        <Button type="primary" loading={submitLoading} onClick={this.handleSubmit}>
          Save
        </Button>
      </PageAnimation>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.competitions.home);
  return {
    id,
    loading:
      !!state.loading.effects['competitions/getDetail'] ||
      !!state.loading.effects['competitions/getSettings'],
    submitLoading:
      !!state.loading.effects['competitions/updateCompetitionDetail'] ||
      !!state.loading.effects['competitions/updateSettings'],
    detail: state.competitions.detail[id],
    settings: state.competitions.settings[id],
  };
}

export default connect(mapStateToProps)(Form.create()(CompetitionBaseSettings));
