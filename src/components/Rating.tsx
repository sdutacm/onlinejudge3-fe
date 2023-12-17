import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Skeleton } from 'antd';

const levelMap = {
  'elder': '长者',
  'immortal': '不朽',
  'legendary': '传说',
  'epic': '史诗',
  'rare': '罕见',
  'excellent': '优秀',
  'common': '普通',
};

const levels = [
  {
    from: -10000,
    to: 1200,
    color: '#969696',
    label: {
      text: '普通',
      style: {
        color: '#ffffff',
      },
    },
  },
  {
    from: 1200,
    to: 1400,
    color: '#28C438',
    label: {
      text: '优秀',
      style: {
        color: '#ffffff',
      },
    },
  },
  {
    from: 1400,
    to: 1600,
    color: '#0099FF',
    label: {
      text: '罕见',
      style: {
        color: '#ffffff',
      },
    },
  },
  {
    from: 1600,
    to: 1900,
    color: '#C600FF',
    label: {
      text: '史诗',
      style: {
        color: '#ffffff',
      },
    },
  },
  {
    from: 1900,
    to: 2200,
    color: '#FF8212',
    label: {
      text: '传说',
      style: {
        color: '#ffffff',
      },
    },
  },
  {
    from: 2200,
    to: 2500,
    color: '#F8BF29',
    label: {
      text: '不朽',
      style: {
        color: '#ffffff',
      },
    },
  },
  {
    from: 2500,
    to: 8000,
    color: '#FB0007',
    label: {
      text: '长者',
      style: {
        color: '#ffffff',
      },
    },
  },
];

export interface Props {
  rating: number;
  ratingHistory: IRatingHistory;
  loading: boolean;
}

interface State {
}

class Rating extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  private chartInput = [];
  private selectedLevels = [];
  private positions = [];

  constructor(props) {
    super(props);
    this.state = {};
  }

  // old
  prepareData(ratingHistory: IRatingHistory) {
    this.chartInput = [];
    let minRating = 0;
    let maxRating = 0;
    if (ratingHistory === null) {
      minRating = levels[0].to;
      maxRating = levels[levels.length - 1].from;
    }
    else {
      minRating = levels[levels.length - 1].to;
      maxRating = levels[0].from;
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < ratingHistory.length; ++i) {
        minRating = Math.min(minRating, ratingHistory[i]['rating']);
        maxRating = Math.max(maxRating, ratingHistory[i]['rating']);
        this.chartInput.push([new Date(ratingHistory[i]['date']).getTime(), ratingHistory[i]['rating']]);
        // if(ratingHistory[i]['rating_change'] >= 0)
        //   ratingHistory[i]['rating_change'] = '+' + ratingHistory[i]['rating_change'];
      }
    }
    let minLevel = 0;
    let maxLevel = levels.length - 1;
    for (let i = 0; i < levels.length; ++i) {
      if (minRating >= levels[i].from && minRating < levels[i].to) {
        if (i > 0) minLevel = i - 1;
        else minLevel = i;
        break;
      }
    }
    for (let i = 0; i < levels.length; ++i) {
      if (maxRating >= levels[i].from && maxRating < levels[i].to) {
        if (i < levels.length - 1) maxLevel = i + 1;
        else maxLevel = i;
        break;
      }
    }
    this.selectedLevels = levels.slice(minLevel, maxLevel + 1);
    this.positions = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.selectedLevels.length; ++i) {
      this.positions.push(this.selectedLevels[i].from);
    }
    this.positions.push(this.selectedLevels[this.selectedLevels.length - 1].to);
    if (this.positions[0] === levels[0].from) {
      this.positions[0] = minRating - 400;
    }
    if (this.positions[this.positions.length - 1] === levels[levels.length - 1].to) {
      this.positions[this.positions.length - 1] = maxRating + 400;
    }
  }

  render() {
    const { rating, ratingHistory, loading } = this.props;
    if (loading) {
      return (
        <Skeleton active paragraph={{ rows: 4, width: '100%' }} />
      );
    }

    if (!rating) {
      return (
        <h3 className="warning-text">No Rating</h3>
      );
    }

    this.prepareData(ratingHistory);
    const options = {
      title: {
        text: null,
      },
      subtitle: {
        text: null,
      },
      chart: {
        backgroundColor: 'transparent',
        height: 300,
      },
      xAxis: {
        type: 'datetime',
        labels: {
          overflow: 'justify',
          style: {
            color: '#999',
          },
        },
        lineColor: 'transparent',
      },
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          style: {
            color: '#999',
          },
        },
        tickPositions: this.positions,
        minorGridLineWidth: 0,
        gridLineWidth: 0,
        alternateGridColor: null,
        plotBands: this.selectedLevels,
      },
      tooltip: {
        useHTML: true,
        animation: true,
        backgroundColor: 'rgba(0, 0, 0, .9)',
        borderColor: '#000',
        style: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        xDateFormat: '%Y-%m-%d',
        pointFormatter: function() {
          return `${ratingHistory[this.index].competition?.title ?? ratingHistory[this.index].contest?.title ?? '-'}<br />
            Rank: <b>${ratingHistory[this.index].rank}</b><br />
            ${this.series.name}: <b>${this.y}</b> (${ratingHistory[this.index].ratingChange >= 0 ? '+' : ''}${ratingHistory[this.index].ratingChange})`;
        },
      },
      plotOptions: {
        series: {
          color: '#dddddd',
          lineWidth: 3,
          marker: {
            fillColor: '#FFFFFF',
            lineWidth: 3,
            lineColor: null, // inherit from series
          },
        },
      },
      series: [{
        name: 'Rating',
        showInLegend: false,
        data: this.chartInput,
      }],
      navigation: {
        menuItemStyle: {
          fontSize: '10px',
        },
      },
      credits: {
        enabled: false,
      },
    };
    let level = '';
    let color = 'inherit';
    for (const lv of levels) {
      if (rating >= lv.from && rating < lv.to) {
        level = lv.label.text;
        color = lv.color;
        break;
      }
    }
    return (
      <div className="rating-history">
        <h3 className="name-rating" style={{ color, fontSize: '1rem' }}>【{level}】{rating}</h3>
        {/*
          // @ts-ignore */}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}

export default Rating;
