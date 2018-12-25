import moment from 'moment';

/**
 * Parse status wording based on time
 * @param {Timestamp} startTime
 * @param {Timestamp} endTime
 * @param {Timestamp} currentTime
 * @returns {string}
 */

type ContestTimeStatus = 'Pending' | 'Running' | 'Ended';

function getSetTimeStatus(startTime: Timestamp, endTime: Timestamp, currentTime: Timestamp): ContestTimeStatus {
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
