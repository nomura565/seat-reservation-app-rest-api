/**
 * Seat Entity
 */
class SeatEntity {
  /**
   * コンストラクタ
   * 
   * @param seat_id 座席ID
   * @param  座席名
   * @param lat 緯度
   * @param lng 経度
   * @param seat_date 座席日時
   * @param user_name 使用者名
   */
  constructor(seat_id, seat_name, lat, lng, seat_date, user_name) {
    this.key   = seat_id + "_" + seat_date;
    this.seat_id   = seat_id;
    this.seat_name = seat_name;
    this.lat  = lat;
    this.lng  = lng;
    this.position  = [lat, lng];
    this.seat_date  = seat_date;
    this.user_name  = user_name;
  }
}

module.exports = SeatEntity;
