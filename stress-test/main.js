import http from 'k6/http';
import { sleep, check, group } from 'k6';

import { requestLogin, requestRegister, requestMe } from './auth.js';
import { requestProfile, requestUpdateProfile } from './profile.js';

const baseUrl = 'http://localhost:3000';

export const options = {
  vus: 300,
  duration: '30s',
  discardResponseBodies: true,
  thresholds: {
    checks: ['rate>0.9'],
    'failed login request': ['rate < 0.1'],
    'failed register request': ['rate < 0.1'],
    'faile update profile request': ['rate < 0.1'],
  },
};

export function setup() {
  const res = http.post(`${baseUrl}/auth/login`, {
    email: 'jane@doe.me',
    password: 'Pa$$w0rd',
  });
  const [, token] = res.headers.Authorization.split(/\s+/);

  return { token };
}

export default function (data) {
  const res = http.get(baseUrl);

  check(res, {
    'status is OK': res => res.status === 200,
  });
  group('Authorization', () => {
    requestLogin(baseUrl);
    requestRegister(baseUrl);
    requestMe(baseUrl, data.token);
  });
  group('User profile', () => {
    requestProfile(baseUrl, data.token);
    requestUpdateProfile(baseUrl, data.token);
  });
  sleep(1);
}