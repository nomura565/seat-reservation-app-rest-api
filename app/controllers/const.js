require('dotenv').config();

module.exports = {
  PERMANENT_DATE: "XXXX/XX/XX",
  GAROON_URL: process.env.GAROON_URL,
  GAROON_GET_SCHEDULE: "api/v1/schedule/events",
  GAROON_HEADER: {
    "X-Cybozu-Authorization": process.env.GAROON_AUTH
  }
}
