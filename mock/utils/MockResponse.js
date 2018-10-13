export function success(data) {
  return {
    ...{
      success: true,
    },
    ...(data ? { data } : { ...data }),
  };
}

export function failure(code, data) {
  return {
    ...{
      success: false,
      code,
      msg: 'mocked msg for code ' + code,
    },
    ...(data ? { data } : { ...data }),
  };
}

export function randomSuccessOrFailure(successProbability, successData, failureCode, failureData) {
  if (Math.random() < successProbability) {
    return success(successData);
  }
  return failure(failureCode, failureData);
}

export function randomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}
