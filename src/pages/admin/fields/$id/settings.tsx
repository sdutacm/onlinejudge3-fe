/**
 * title: Admin Field Settings
 */

import React from 'react';
import { connect } from 'dva';
import { ReduxProps, RouteProps } from '@/@types/props';
import PageAnimation from '@/components/PageAnimation';
import { Button, Spin, InputNumber } from 'antd';
import { getPathParamId } from '@/utils/getPathParams';
import pages from '@/configs/pages';
import NotFound from '@/pages/404';
import PageTitle from '@/components/PageTitle';
import FieldSeatInput from '@/components/FieldSeatInput';
import { memoize } from '@/utils/decorators';
import { padStart } from 'lodash';
import msg from '@/utils/msg';
import tracker from '@/utils/tracker';

const MAX_SEAT_SIZE = 100;

export interface Props extends RouteProps, ReduxProps {
  id: number;
  session: ISessionStatus;
  detail: IField | null;
  loading: boolean;
  submitLoading: boolean;
}

interface State {
  tempRow?: number;
  tempCol?: number;
  row: number;
  col: number;
  arrangement: (number | null)[][];
  seatMap: Map</** seatNo */ number, { boundIp?: string }>;
}

class AdminFieldSettings extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {};

  constructor(props) {
    super(props);
    const arrangement: (number | null)[][] = [];
    this.state = {
      row: 0,
      col: 0,
      arrangement,
      seatMap: new Map(),
    };
  }

  componentWillReceiveProps(np: Props) {
    if (np.detail?.seatingArrangement !== this.props.detail?.seatingArrangement) {
      const row = np.detail.seatingArrangement?.seatMap?.row || 0;
      const col = np.detail.seatingArrangement?.seatMap?.col || 0;
      const nextArrangement = np.detail.seatingArrangement?.seatMap?.arrangement || [];
      const nextSeats = np.detail.seatingArrangement?.seats || [];
      const arrangement: (number | null)[][] = new Array(row).fill(null);
      arrangement.forEach((_, index) => (arrangement[index] = new Array(col).fill(null)));
      for (let i = 0; i < row; ++i) {
        for (let j = 0; j < col; ++j) {
          arrangement[i][j] = nextArrangement[i][j];
        }
      }
      const seatMap = new Map<number, { boundIp: string }>();
      nextSeats.forEach((s) => {
        seatMap.set(s.seatNo, {
          boundIp: s.boundIp,
        });
      });
      this.setState({
        tempRow: np.detail.seatingArrangement?.seatMap?.row || undefined,
        tempCol: np.detail.seatingArrangement?.seatMap?.col || undefined,
        row,
        col,
        arrangement,
        seatMap,
      });
    }
  }

  @memoize
  usedSeatNoList(row: number, col: number, arrangement: (number | null)[][]): number[] {
    let seatNoArr: number[] = [];
    for (let i = 0; i < row; ++i) {
      for (let j = 0; j < col; ++j) {
        if (arrangement[i][j]) {
          seatNoArr.push(arrangement[i][j]);
        }
      }
    }
    return seatNoArr.sort((a, b) => a - b);
  }

  @memoize
  nextSeatNoImpl(row: number, col: number, arrangement: (number | null)[][]): number {
    const seatNoArr = this.usedSeatNoList(row, col, arrangement);
    let seatNo = 1;
    for (const curSeatNo of seatNoArr) {
      if (seatNo !== curSeatNo) {
        break;
      }
      seatNo++;
    }
    return seatNo;
  }

  @memoize
  maxSeatNoDigitsImpl(row: number, col: number, arrangement: (number | null)[][]): number {
    const seatNoArr = this.usedSeatNoList(row, col, arrangement);
    const max = seatNoArr[seatNoArr.length - 1];
    if (!max) {
      return 1;
    }
    return `${max}`.length;
  }

  get nextSeatNo() {
    const { row, col, arrangement } = this.state;
    return this.nextSeatNoImpl(row, col, arrangement);
  }

  get maxSeatNoDigits() {
    const { row, col, arrangement } = this.state;
    return this.maxSeatNoDigitsImpl(row, col, arrangement);
  }

  formatSeatNo = (seatNo: number) => {
    return padStart(`${seatNo}`, this.maxSeatNoDigits, '0');
  };

  changeSize = () => {
    const { tempRow: row, tempCol: col, arrangement, seatMap } = this.state;
    if (!row || !col) {
      return;
    }
    // 截取数组
    const newArrangement: (number | null)[][] = new Array(row).fill(null);
    newArrangement.forEach((_, index) => (newArrangement[index] = new Array(col).fill(null)));
    for (let i = 0; i < row; ++i) {
      for (let j = 0; j < col; ++j) {
        newArrangement[i][j] = arrangement[i]?.[j] || null;
      }
    }
    // 更新 seatMap（删除被裁剪掉的座位信息）
    arrangement.forEach((rowData, indexR) => {
      rowData.forEach((seatNo, indexC) => {
        if (seatNo && (indexR >= row || indexC >= col)) {
          seatMap.delete(seatNo);
        }
      });
    });
    this.setState({
      row,
      col,
      arrangement: newArrangement,
      seatMap,
    });
  };

  validateSeatNo = (indexR: number, indexC: number, seatNo: number) => {
    const { row, col, arrangement } = this.state;
    const curSeatNo = arrangement[indexR][indexC];
    if (seatNo === curSeatNo) {
      return null;
    }
    for (let i = 0; i < row; ++i) {
      for (let j = 0; j < col; ++j) {
        if (seatNo === arrangement[i][j]) {
          return `Seat No. ${seatNo} has been used`;
        }
      }
    }
    return null;
  };

  handleSeatInputChange = (
    indexR: number,
    indexC: number,
    { seatNo, boundIp }: { seatNo: number; boundIp?: string },
  ) => {
    const { row, col, arrangement, seatMap } = this.state;
    const newArrangement: (number | null)[][] = new Array(row).fill(null);
    newArrangement.forEach((_, index) => (newArrangement[index] = new Array(col).fill(null)));
    for (let i = 0; i < row; ++i) {
      for (let j = 0; j < col; ++j) {
        newArrangement[i][j] = arrangement[i][j];
      }
    }
    newArrangement[indexR][indexC] = seatNo;
    seatMap.set(seatNo, { boundIp });
    this.setState({
      arrangement: newArrangement,
      seatMap,
    });
  };

  handleSeatInputDelete = (indexR: number, indexC: number) => {
    const { row, col, arrangement, seatMap } = this.state;
    const newArrangement: (number | null)[][] = new Array(row).fill(null);
    newArrangement.forEach((_, index) => (newArrangement[index] = new Array(col).fill(null)));
    for (let i = 0; i < row; ++i) {
      for (let j = 0; j < col; ++j) {
        newArrangement[i][j] = arrangement[i][j];
      }
    }
    const preSeatNo = newArrangement[indexR][indexC];
    newArrangement[indexR][indexC] = null;
    seatMap.delete(preSeatNo);
    this.setState({
      arrangement: newArrangement,
      seatMap,
    });
  };

  save = () => {
    const seatMap = {
      row: this.state.row,
      col: this.state.col,
      arrangement: this.state.arrangement,
    };
    const seats: {
      seatNo: number;
      boundIp?: string;
    }[] = [];
    for (const [seatNo, info] of this.state.seatMap) {
      seats.push({
        seatNo,
        ...info,
      });
    }
    this.props
      .dispatch({
        type: 'admin/updateFieldDetail',
        payload: { id: this.props.id, data: { seatingArrangement: { seatMap, seats } } },
      })
      .then((ret) => {
        msg.auto(ret);
        if (ret.success) {
          msg.success('Updated');
          tracker.event({
            category: 'admin',
            action: 'updateFieldDetail',
          });
          this.props.dispatch({
            type: 'admin/getFieldDetail',
            payload: {
              id: this.props.id,
            },
          });
        }
      });
  };

  renderSeatingArrangementCol = (indexR: number, indexC: number) => {
    const seatNo = this.state.arrangement[indexR][indexC];
    const boundIp = this.state.seatMap.get(seatNo)?.boundIp;
    const inner = seatNo ? (
      <div className={`field-seat-arrangement-col ${boundIp ? 'info' : 'set'}`}>
        {this.formatSeatNo(seatNo)}
      </div>
    ) : (
      <div className="field-seat-arrangement-col"></div>
    );
    return (
      <FieldSeatInput
        nextSeatNo={this.nextSeatNo}
        seatNo={seatNo}
        boundIp={boundIp}
        validateSeatNo={(seatNo) => this.validateSeatNo(indexR, indexC, seatNo)}
        onChange={(info) => this.handleSeatInputChange(indexR, indexC, info)}
        onDelete={() => this.handleSeatInputDelete(indexR, indexC)}
      >
        {inner}
      </FieldSeatInput>
    );
  };

  renderSeatingArrangementRow = (indexR: number) => {
    return (
      <div className="field-seat-arrangement-row">
        {new Array(this.state.col)
          .fill(null)
          .map((_, indexC) => this.renderSeatingArrangementCol(indexR, indexC))}
      </div>
    );
  };

  renderSeatingArrangement = () => {
    return (
      <div className="field-seat-arrangement">
        {new Array(this.state.row)
          .fill(null)
          .map((_, indexR) => this.renderSeatingArrangementRow(indexR))}
      </div>
    );
  };

  render() {
    const { id, detail, loading, submitLoading, session } = this.props;
    const { tempRow, tempCol, row, col, arrangement } = this.state;
    if (loading) {
      return <Spin />;
    }
    if (!detail) {
      return <NotFound />;
    }
    return (
      <PageTitle title={detail.name} loading={loading}>
        <PageAnimation>
          <h4 className="mb-md-lg">
            Field Settings of {detail.name} ({detail.shortName})
          </h4>
          <div>
            <span>Field Size</span>
            <InputNumber
              className="ml-md"
              style={{ width: '60px' }}
              size="small"
              min={1}
              max={MAX_SEAT_SIZE}
              defaultValue={tempRow}
              precision={0}
              placeholder="Row"
              onChange={(num) => this.setState({ tempRow: Math.floor(+num) })}
            />
            <InputNumber
              className="ml-md"
              style={{ width: '60px' }}
              size="small"
              min={1}
              max={MAX_SEAT_SIZE}
              defaultValue={tempCol}
              precision={0}
              placeholder="Col"
              onChange={(num) => this.setState({ tempCol: Math.floor(+num) })}
            />
            <Button className="ml-lg" size="small" onClick={this.changeSize}>
              Apply
            </Button>
          </div>
          <div className="mt-xl">
            <span>Seat Arrangement</span>
            <Button className="ml-lg" size="small" type="primary" onClick={this.save}>
              Save
            </Button>
          </div>
          <div className="mt-lg">{this.renderSeatingArrangement()}</div>
        </PageAnimation>
      </PageTitle>
    );
  }
}

function mapStateToProps(state) {
  const id = getPathParamId(state.routing.location.pathname, pages.admin.fieldSettings);
  return {
    id,
    session: state.session,
    loading: !!state.loading.effects['admin/getFieldDetail'],
    detail: state.admin.fieldDetail[id] || null,
    submitLoading: !!state.loading.effects['admin/updateFieldDetail'],
  };
}

export default connect(mapStateToProps)(AdminFieldSettings);
