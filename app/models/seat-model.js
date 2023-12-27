const Model = require('./model');
const SeatEntity = require('../entities/seat-entity');
const FloorEntity = require('../entities/floor-entity');

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
            row.image_data));
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
        image_data
      ) VALUES (
          $seat_id,
          $seat_date,
          $user_name,
          $image_data
      )
    `;
    const params = {
      $seat_id: seat_info.seat_id,
      $seat_date: seat_info.seat_date,
      $user_name: seat_info.user_name,
      $image_data: seat_info.image_data,
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
  calendar(seat_id, date_ym) {
    const sql = `
      SELECT
        seat_id
        ,seat_date
        ,user_name
      FROM
        seat_info
      WHERE
        seat_id = $seat_id
        AND seat_date LIKE $date_ym
      ORDER BY
        user_name
        ,seat_date
    `;
    const params = {
      $seat_id: seat_id,
      $date_ym: date_ym + "%"
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
            ""));
        }

        return seats;
      });
  }
}



module.exports = SeatModel;
