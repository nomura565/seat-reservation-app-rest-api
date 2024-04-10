/**
 * Reply Entity
 */
class ReplyEntity {
  /**
   * コンストラクタ
   * 
   * @param seat_id 席ID
   * @param seat_date 座席日時
   * @param seq シーケンス
   * @param comment コメント
   */
  constructor(seat_id, seat_date, seq, comment) {
    this.key = seat_id + "_" + seat_date + "_" + seq;
    this.seat_id = seat_id;
    this.seat_date = seat_date;
    this.seq = seq;
    this.comment = comment;
  }
}

module.exports = ReplyEntity;
