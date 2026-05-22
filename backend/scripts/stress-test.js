import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE_URL = "http://localhost:3000/api";

const bookResponseTime = new Trend("book_response_time");
const badgeResponseTime = new Trend("badge_response_time");
const errorRate = new Rate("error_rate");

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    error_rate: ["rate<0.05"],
  },
};

let token;

export default function () {
  if (!token) {
    const loginRes = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({ email: "admin@gmail.com", password: "asdASD123" }),
      { headers: { "Content-Type": "application/json" } },
    );
    check(loginRes, { "login successful": (r) => r.status === 200 });
    if (loginRes.status === 200) {
      token = JSON.parse(loginRes.body).data.accessToken; // ← itt volt a hiba
    }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const ownedRes = http.get(`${BASE_URL}/books/user/owned`, { headers });
  bookResponseTime.add(ownedRes.timings.duration);
  errorRate.add(ownedRes.status !== 200);
  check(ownedRes, { "owned books 200": (r) => r.status === 200 });
  sleep(0.5);

  const bookRes = http.get(
    `${BASE_URL}/books/a88e154e-b150-4bb0-bcb1-43798a3479fb`,
  );
  bookResponseTime.add(bookRes.timings.duration);
  errorRate.add(bookRes.status !== 200);
  check(bookRes, { "book detail 200": (r) => r.status === 200 });
  sleep(0.5);

  const badgeRes = http.get(`${BASE_URL}/badges/my`, { headers });
  badgeResponseTime.add(badgeRes.timings.duration);
  errorRate.add(badgeRes.status !== 200);
  check(badgeRes, { "badges 200": (r) => r.status === 200 });
  sleep(0.5);

  const allBadgesRes = http.get(`${BASE_URL}/badges/all`);
  badgeResponseTime.add(allBadgesRes.timings.duration);
  errorRate.add(allBadgesRes.status !== 200);
  check(allBadgesRes, { "all badges 200": (r) => r.status === 200 });
  sleep(0.5);

  const feedRes = http.get(`${BASE_URL}/activity/feed`, { headers });
  errorRate.add(feedRes.status !== 200);
  check(feedRes, { "feed 200": (r) => r.status === 200 });
  sleep(1);
}
