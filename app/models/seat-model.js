const Model = require('./model');
const SeatEntity = require('../entities/seat-entity');
const FloorEntity = require('../entities/floor-entity');
const ReplyEntity = require('../entities/reply-entity');

/**
 * Seat Model
 */
class SeatModel {
  /**
   * コンストラクタ
   */
  constructor() {
    this.model = new Model();
  }

  /**
   * 全件取得する
   * 
   * @return Entity の配列を Resolve する
   */
  findAllFloor() {
    const sql = `
      SELECT
        *
      FROM
        floor_master f
      ORDER BY floor_id 
    `;

    return this.model.findAll(sql)
      .then((rows) => {
        const seats = [];

        for (const row of rows) {
          seats.push(new FloorEntity(
            row.floor_id,
            row.floor_name,
            row.floor_map));
        }

        return seats;
      });
  }

  /**
   * 全件取得する
   * 
   * @return Entity の配列を Resolve する
   */
  findAll() {
    const sql = `
      SELECT
        m.*
        ,i.seat_date
        ,i.user_name
      FROM
        seat_master m 
        left join seat_info i
        on m.seat_id = i.seat_id
    `;

    return this.model.findAll(sql)
      .then((rows) => {
        const seats = [];

        for (const row of rows) {
          seats.push(new SeatEntity(
            row.seat_id,
            row.seat_name,
            row.lat,
            row.lng,
            row.seat_date,
            row.user_name));
        }

        return seats;
      });
  }

  /**
   * seat_date を指定して複数件検索する
   * 
   * @param seat_date seat_date
   * @return Entity を Resolve する
   */
  findBySeatDate(seat_date, floor_id) {
    const sql = `
      SELECT
        m.*
        ,i.seat_date
        ,i.user_name
        ,i.image_data
        ,i.comment
      FROM
        (select * from seat_master where floor_id = $floor_id) m 
        left join  (select * from seat_info where seat_date=$seat_date OR seat_date="XXXX/XX/XX") i
        on m.seat_id = i.seat_id
    `;
    const params = {
      $seat_date: seat_date,
      $floor_id: floor_id
    };

    return this.model.findSelect(sql, params)
      .then((rows) => {
        const seats = [];

        for (const row of rows) {
          seats.push(new SeatEntity(
            row.seat_id,
            row.seat_name,
            row.lat,
            row.lng,
            row.tooltip_direction,
            row.seat_date,
            row.user_name,
            row.image_data,
            row.comment));
        }

        return seats;
      });
  }

  /**
   * 登録する
   * 
   * @param seat_info 登録情報を持つ Entity
   * @return 登録できたら Resolve する
   */
  create(seat_info) {
    // ID は自動採番させる
    const sql = `
      INSERT INTO seat_info (
        seat_id,
        seat_date,
        user_name,
        image_data,
        comment
      ) VALUES (
          $seat_id,
          $seat_date,
          $user_name,
          $image_data,
          $comment
      )
    `;
    const params = {
      $seat_id: seat_info.seat_id,
      $seat_date: seat_info.seat_date,
      $user_name: seat_info.user_name,
      $image_data: seat_info.image_data,
      $comment: seat_info.comment,
    };

    return this.model.run(sql, params)
      .then((id) => {
        // 登録したデータを返却する
        //return this.findById(seat_info.seat_id, seat_info.seat_date);
      });
  }

  /**
   * 削除する
   * 
   * @param seat_id seat_id
   * @param seat_date seat_date
   * @return 削除できたら Resolve する
   */
  delete(seat_id, seat_date, to_date, user_name) {
    const sql = `
      DELETE FROM
        seat_info
      WHERE
        seat_id = $seat_id
        AND (
          (seat_date BETWEEN  $seat_date AND $to_date AND user_name = $user_name)
          OR seat_date = "XXXX/XX/XX")
    `;
    const params = {
      $seat_id: seat_id,
      $seat_date: seat_date,
      $to_date: to_date,
      $user_name: user_name
    };

    return this.model.run2(sql, params);
  }

  /**
   * 削除する
   * 
   * @param seat_id seat_id
   * @return 削除できたら Resolve する
   */
  deleteAllSeatId(seat_id) {
    const sql = `
      DELETE FROM
        seat_info
      WHERE
        seat_id = $seat_id
    `;
    const params = {
      $seat_id: seat_id
    };

    return this.model.run2(sql, params);
  }

  /**
  * 更新する
  * 
  * @param seat_info 登録情報を持つ Entity
  * @return 登録できたら Resolve する
  */
  update(seat_info) {
    const sql = `
      UPDATE seat_master SET
        lat = $lat,
        lng = $lng
      WHERE seat_id = $seat_id
    `;
    const params = {
      $seat_id: seat_info.seat_id,
      $lat: seat_info.lat,
      $lng: seat_info.lng
    };

    return this.model.run(sql, params)
      .then((id) => {
        // 登録したデータを返却する
        //return this.findById(seat_info.seat_id, seat_info.seat_date);
      });
  }
  /**
* 登録する
* 
* @param seat_info 登録情報を持つ Entity
* @return 登録できたら Resolve する
*/
  insert(seat_info, floor_id) {
    let temp_sql = "";
    let temp_params = {};
    let temp_seat_id = String(seat_info.seat_id);

    if (temp_seat_id.indexOf("追加") >= 0) {
      temp_sql = `
          INSERT INTO seat_master (
            seat_id,
            lat,
            lng,
            floor_id,
            seat_name,
            tooltip_direction
          ) VALUES (
              (SELECT MAX(coalesce(seat_id, 0))+1 FROM seat_master) ,
              $lat,
              $lng,
              $floor_id,
              $seat_name,
              $tooltip_direction
          )
        `;
      temp_params = {
        $lat: seat_info.lat,
        $lng: seat_info.lng,
        $floor_id: floor_id,
        $seat_name: seat_info.seat_name,
        $tooltip_direction: seat_info.tooltip_direction
      };
    } else {
      temp_sql = `
          INSERT INTO seat_master (
            seat_id,
            lat,
            lng,
            floor_id,
            seat_name,
            tooltip_direction
          ) VALUES (
              $seat_id,
              $lat,
              $lng,
              $floor_id,
              $seat_name,
              $tooltip_direction
          )
        `;
      temp_params = {
        $seat_id: seat_info.seat_id,
        $lat: seat_info.lat,
        $lng: seat_info.lng,
        $floor_id: floor_id,
        $seat_name: seat_info.seat_name,
        $tooltip_direction: seat_info.tooltip_direction
      };
    }

    return this.model.run(temp_sql, temp_params)
      .then((id) => {
        // 登録したデータを返却する
        //return this.findById(seat_info.seat_id, seat_info.seat_date);
      });
  }
  /**
 * 座席マスタを全件削除する
 * 
 * @return 削除できたら Resolve する
 */
  deleteAllSeatMaster(floor_id) {
    const sql = `
        DELETE FROM
          seat_master
        WHERE floor_id = $floor_id
      `;
    const params = {
      $floor_id: floor_id
    };

    return this.model.run2(sql, params);
  }
  /**
   * YMと席ID を指定して複数件取得
   * 
   * @param seat_id 席ID
   * @param date_ym 年月 yyyy/MM
   * @return Entity を Resolve する
   */
  calendar(seat_id, date_ym, date_ym_next, date_ym_prev) {
    const sql = `
      SELECT
        seat_id
        ,seat_date
        ,user_name
      FROM
        seat_info
      WHERE
        seat_id = $seat_id
        AND (seat_date LIKE $date_ym OR seat_date LIKE $date_ym_next OR seat_date LIKE $date_ym_prev)
      ORDER BY
        user_name
        ,seat_date
    `;
    const params = {
      $seat_id: seat_id,
      $date_ym: date_ym + "%",
      $date_ym_next: date_ym_next + "%",
      $date_ym_prev: date_ym_prev + "%"
    };

    return this.model.findSelect(sql, params)
      .then((rows) => {
        const seats = [];

        for (const row of rows) {
          seats.push(new SeatEntity(
            row.seat_id,
            "",
            "",
            "",
            "",
            row.seat_date,
            row.user_name,
            "",
            ""));
        }

        return seats;
      });
  }

  /**
   * リプライ一覧取得
   * 
   * @param seat_id 席ID
   * @param seat_date 座席日時
   * @return Entity を Resolve する
   */
  replySelect(seat_id, seat_date) {
    const sql = `
      SELECT
        *
      FROM
        reply_info
      WHERE
        seat_id = $seat_id
        AND seat_date = $seat_date
      ORDER BY
        seq
    `;
    const params = {
      $seat_id: seat_id,
      $seat_date: seat_date
    };

    return this.model.findSelect(sql, params)
      .then((rows) => {
        const replys = [];

        for (const row of rows) {
          replys.push(new ReplyEntity(
            row.seat_id,
            row.seat_date,
            row.seq,
            row.comment));
        }

        return replys;
      });
  }

  /**
   * リプライ登録
   * 
   * @param seat_id 席ID
   * @param seat_date 座席日時
   * @param comment コメント
   * @return 登録できたら Resolve する
   */
  replyInsert(seat_id, seat_date, comment) {
    // ID は自動採番させる
    const sql = `
      INSERT INTO reply_info (
        seat_id,
        seat_date,
        seq,
        comment
      ) VALUES (
          $seat_id,
          $seat_date,
          (SELECT coalesce(r.seq, 0) + 1 FROM seat_info s 
            LEFT JOIN
            (
            SELECT seat_id, seat_date, MAX(coalesce(seq, 1)) AS seq
            FROM reply_info 
                WHERE seat_id = $seat_id AND seat_date = $seat_date
                GROUP BY seat_id, seat_date
            ) r
            ON s.seat_id = r.seat_id AND s.seat_date = r.seat_date
            WHERE s.seat_id = $seat_id AND s.seat_date = $seat_date
          ),
          $comment
      )
    `;
    const params = {
      $seat_id: seat_id,
      $seat_date: seat_date,
      $comment: comment,
    };

    return this.model.run(sql, params)
      .then((id) => {
        // 登録したデータを返却する
        //return this.findById(seat_info.seat_id, seat_info.seat_date);
      });
  }

  /**
   * 削除する席に紐づくリプライを削除する
   * 
   * @param seat_id seat_id
   * @param seat_date seat_date
   * @return 削除できたら Resolve する
   */
  deleteReplyInfo(seat_id, seat_date, to_date, user_name) {
    const sql = `
      DELETE FROM
        reply_info
      WHERE
        seat_id = $seat_id
        AND (
          (seat_date BETWEEN  $seat_date AND $to_date
          AND seat_date IN (SELECT s.seat_date 
          FROM seat_info s WHERE s.user_name = $user_name)
          )
          OR seat_date = "XXXX/XX/XX")
    `;
    const params = {
      $seat_id: seat_id,
      $seat_date: seat_date,
      $to_date: to_date,
      $user_name: user_name
    };

    return this.model.run2(sql, params);
  }

  /**
 * 座席使用確認
 * 
 * @param seat_id seat_id
 * @param from_date from_date
 * @param to_date to_date
 * @return Entity を Resolve する
 */
  confirmSeatUse(seat_id, from_date, to_date) {
    const sql = `
        SELECT
          *
        FROM
          seat_info
        WHERE 
          seat_id = $seat_id
          AND (
            (seat_date >= $from_date
            AND seat_date <= $to_date) 
            OR seat_date = "XXXX/XX/XX"
          )
      `;
    const params = {
      $seat_id: seat_id,
      $from_date: from_date,
      $to_date: to_date
    };

    return this.model.findSelect(sql, params)
      .then((rows) => {
        const seats = [];

        for (const row of rows) {
          seats.push(new SeatEntity(
            row.seat_id,
            "",
            "",
            "",
            "",
            row.seat_date,
            row.user_name,
            "",
            ""));
        }

        return seats;
      });
  }
  /**
   * コメント一覧取得
   * 
   * @param seat_date 座席日時
   * @return Entity を Resolve する
   */
  commentSelect(seat_date) {
    const sql = `
      SELECT
        si.seat_id,
        si.seat_date,
        si.user_name,
        si.comment,
        ri.comment AS reply,
        ri.seq
      FROM seat_info si
      LEFT JOIN reply_info ri
      ON si.seat_id = ri.seat_id
      AND si.seat_date = ri.seat_date
      WHERE (si.comment IS NOT NULL OR ri.comment IS NOT NULL)
      AND si.seat_date = $seat_date
      ORDER BY si. seat_id, ri.seq
    `;
    const params = {
      $seat_date: seat_date
    };

    return this.model.findSelect(sql, params)
      .then((rows) => {
        const comments = [];

        for (const row of rows) {
          let comment = new ReplyEntity(
            row.seat_id,
            row.seat_date,
            row.seq,
            row.comment);
            comment["user_name"] = row.user_name;

            let tmpComment = comments.filter((c) => c.seat_id === row.seat_id)[0];
            if(typeof tmpComment !== "undefined"){
              tmpComment["replys"].push(row.reply);
            } else {
              if(row.reply != null){
                comment["replys"] = [row.reply];
              } else {
                comment["replys"] = [];
              }
              comments.push(comment);
            }
            
        }

        return comments;
      });
  }
}



module.exports = SeatModel;
