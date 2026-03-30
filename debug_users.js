import http from 'k6/http';

const credentials = [
  { username: "donero", password: "ewedon" },
  { username: "kevinryan", password: "key02937@" },
  { username: "johnd", password: "m38rmF$" },
  { username: "derek", password: "jklg*_56" },
  { username: "mor_2314", password: "83r5^_" }
];

export default function () {
  for (let cred of credentials) {
    const res = http.post(
      'https://fakestoreapi.com/auth/login',
      JSON.stringify(cred),
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(`User: ${cred.username.padEnd(10)} | Status: ${res.status}`);
  }
}
