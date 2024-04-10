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
   * @param tooltip_direction ツールチップの開く方向
   * @param seat_date 座席日時
   * @param user_name 使用者名
   * @param image_data 画像データ（base64）
   */
  constructor(seat_id, seat_name, lat, lng, tooltip_direction, seat_date, user_name, image_data, comment) {
    this.key = seat_id + "_" + seat_date;
    this.seat_id = seat_id;
    this.seat_name = seat_name;
    this.lat = lat;
    this.lng = lng;
    this.tooltip_direction = tooltip_direction
    this.position = [lat, lng];
    this.seat_date = seat_date;
    this.user_name = user_name;
    this.image_data = image_data;
    this.comment = comment;
  }
}

module.exports = SeatEntity;
