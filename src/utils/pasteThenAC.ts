const PASTE_THEN_AC_API_BASE_URL = 'https://paste.then.ac.api.algoux.cn/api';

function formatAPIResponse(res: any) {
  if (res?.success) {
    return res.data;
  }
  if (res?.success === false) {
    throw new Error(`API Error: ${res.msg} (${res.code})`);
  }
  throw new Error('API Error: Unknown error');
}


export function addPiece(
  data: { code: string; lang: string; ttl: number, relLinks?: string[] },
  options: RequestInit = {},
): Promise<{ key: string; url: string }> {
  return fetch(`${PASTE_THEN_AC_API_BASE_URL}/addPiece`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
    .then((res) => res.json())
    .then((res) => formatAPIResponse(res));
}
