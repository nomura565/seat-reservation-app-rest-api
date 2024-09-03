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
   * @param facility_flg 施設フラグ
   * @param facility_id 施設ID
   * @param sitting_flg 在席フラグ
   * @param reply_count リプライ数
   * @param comment_reply_count コメント有無とリプライ数の計
   */
  constructor(seat_id, seat_name, lat, lng, tooltip_direction, seat_date
    , user_name, image_data, comment, facility_flg, facility_id, sitting_flg, reply_count, comment_reply_count) {
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
    this.facility_flg = facility_flg;
    this.facility_id = facility_id;
    this.sitting_flg = sitting_flg;
    this.reply_count = reply_count;
    this.comment_reply_count = comment_reply_count;
  }
}

module.exports = SeatEntity;
