import moment from 'moment';

/**
 * Parse status wording based on time
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} currentTime
 * @returns {string}
 */
function getSetTimeStatus(startTime: string, endTime: string, currentTime: string): string {
  if (moment(currentTime).isBefore(startTime)) {
    return 'Pending';
  }
  else if (moment(currentTime).isSame(endTime) || moment(currentTime).isAfter(endTime)) {
    return 'Ended';
  }
  else {
    return 'Running';
  }
}

export default getSetTimeStatus;
