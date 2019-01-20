import moment from 'moment';

/**
 * Parse status wording based on time
 * @param {ITimestamp} startTime
 * @param {ITimestamp} endTime
 * @param {ITimestamp} currentTime
 * @returns {string}
 */

export type ContestTimeStatus = 'Pending' | 'Running' | 'Ended';

function getSetTimeStatus(startTime: ITimestamp, endTime: ITimestamp, currentTime: ITimestamp): ContestTimeStatus {
  if (currentTime < startTime) {
    return 'Pending';
  }
  else if (startTime <= currentTime && currentTime < endTime) {
    return 'Running';
  }
  else {
    return 'Ended';
  }
}

export default getSetTimeStatus;
