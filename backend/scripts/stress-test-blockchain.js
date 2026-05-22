import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE_URL = "http://localhost:3000/api";

const bookCreateTime = new Trend("book_create_time");
const errorRate = new Rate("error_rate");

export const options = {
  stages: [
    { duration: "30s", target: 2 },
    { duration: "60s", target: 2 },
    { duration: "30s", target: 5 },
    { duration: "60s", target: 5 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<10000"],
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

    // console.log(`login status: ${loginRes.status}, body: ${loginRes.body}`);

    check(loginRes, { "login successful": (r) => r.status === 200 });
    if (loginRes.status === 200) {
      token = JSON.parse(loginRes.body).data.accessToken;
    }
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // --- POST /books ---
  const uniqueTitle = `StressBook-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const bookRes = http.post(
    `${BASE_URL}/books`,
    JSON.stringify({
      title: uniqueTitle,
      author: "StressTest Author",
      cover_image_url: "/uploads/covers/test.png",
      original_owner: "042ca307-681c-4db6-96b4-a45dd06e1bea",
    }),
    { headers },
  );

  bookCreateTime.add(bookRes.timings.duration);
  errorRate.add(bookRes.status !== 200);
  check(bookRes, { "book created 200": (r) => r.status === 200 });

  sleep(5);
}
