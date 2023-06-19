const sqliite3 = require('sqlite3').verbose();

/** DB ファイルを生成 or 取得する */
const db = new sqliite3.Database('./app/db/sqlite3-database.db');

/** DB の初期化処理 */
const init = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id    INTEGER  PRIMARY KEY  AUTOINCREMENT,
      name  TEXT,
      age   INTEGER
    );
    CREATE TABLE IF NOT EXISTS seat_master (
      seat_id INTEGER not null primary key
      , seat_name TEXT
      , lat INTEGER not null
      , lng INTEGER not null
      , tooltip_direction TEXT
    );
    CREATE TABLE IF NOT EXISTS seat_info (
      seat_id INTEGER not null
      , seat_date TEXT not null
      , user_name TEXT
      ,PRIMARY KEY(seat_id, seat_date)
    );
  `);
};

module.exports = {
  db: db,
  init: init
};
