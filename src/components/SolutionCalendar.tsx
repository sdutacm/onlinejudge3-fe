import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';

export interface Props {
  data: ISolutionCalendar;
  startDate?: string;
  endDate?: string;
}

interface State {}

class SolutionCalendar extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    startDate: moment()
      .subtract(1, 'year')
      .add(1, 'day')
      .format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    ReactTooltip.rebuild();
  }

  render() {
    const { data, startDate, endDate } = this.props;
    return (
      <div>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={data || []}
          classForValue={(value) => {
            let level = 0;
            if (!value || value.count <= 0) {
              level = 0;
            } else if (value.count <= 2) {
              level = 1;
            } else if (value.count <= 5) {
              level = 2;
            } else if (value.count <= 10) {
              level = 3;
            } else {
              level = 4;
            }
            return `solution-calendar solution-calendar-color-${level}`;
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.count) {
              return null;
            }
            return {
              'data-tip': `[${value.date}] Accepted: ${value.count}`,
            };
          }}
        />
        <ReactTooltip />
      </div>
    );
  }
}

export default SolutionCalendar;
