const baseUrl = process.env.DASHBOARD_API_BASE;
const token = process.env.DASHBOARD_API_TOKEN;
const timeZone = process.env.DASHBOARD_API_TZ || 'Asia/Ho_Chi_Minh';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: unknown;
};

async function callApi<T>(path: string) {
  if (!baseUrl || !token) {
    throw new Error('Missing DASHBOARD_API_BASE or DASHBOARD_API_TOKEN env');
  }

  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Timezone': timeZone,
    },
  });

  const body = (await response.json()) as ApiResponse<T>;
  return { status: response.status, body };
}

describe('Dashboard APIs (real)', () => {
  jest.setTimeout(20000);

  it('GET /home/summary', async () => {
    const result = await callApi<unknown>('/home/summary');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('GET /home/continue', async () => {
    const result = await callApi<unknown>('/home/continue');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('GET /progress/today', async () => {
    const result = await callApi<unknown>('/progress/today');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('GET /progress/weekly', async () => {
    const result = await callApi<unknown>('/progress/weekly');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('GET /streak', async () => {
    const result = await callApi<unknown>('/streak');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('GET /review/summary', async () => {
    const result = await callApi<unknown>('/review/summary');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('GET /review/queue', async () => {
    const result = await callApi<unknown>('/review/queue');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  it('GET /notification/summary', async () => {
    const result = await callApi<unknown>('/notification/summary');
    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });
});
