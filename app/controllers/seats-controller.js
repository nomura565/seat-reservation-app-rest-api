const Controller = require('./controller');
const SeatModel  = require('../models/seat-model');
const SeatEntity = require('../entities/seat-entity');

const format = require('date-fns/format');
const parse = require('date-fns/parse');
const ja = require( 'date-fns/locale/ja');

const formatDate = (date) => {
  const d = new Date(date.toString());
  return format(
    d,
    "yyyy/MM/dd", {
    locale: ja,
  });
}
/**
 * Seats Controller
 */
class SeatsController {
  /**
   * コンストラクタ
   */
  constructor() {
    this.controller = new Controller();
    this.seatModel = new SeatModel();
  }

   /**
   * 全件取得する
   * 
   * @param res レスポンス
   */
   findAllFloor(res) {
    this.seatModel.findAllFloor()
      .then(this.controller.findSuccess(res))
      .catch(this.controller.findError(res));
  }
  
  /**
   * 全件取得する
   * 
   * @param res レスポンス
   */
  findAll(res) {
    this.seatModel.findAll()
      .then(this.controller.findSuccess(res))
      .catch(this.controller.findError(res));
  }

   /**
   * seat_date を指定して複数件取得する
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
   findBySeatDate(req, res) {
    const seat_date = req.body.seat_date;
    const floor_id = req.body.floor_id;
    
    this.seatModel.findBySeatDate(seat_date, floor_id)
      .then(this.controller.findSuccess(res))
      .catch(this.controller.findError(res));
  }
  
  /**
   * 登録する
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  create(req, res) {
    let result = true;
    this.seatModel.model.BeginTransaction();
    const main = async () => {
      return new Promise(async (resolve, reject) => {
        let from_date = req.body.from_date;
        let to_date = req.body.to_date;
        let permanent_flg = req.body.permanent_flg;

        let from_p = parse(from_date, "yyyy/MM/dd", new Date());

        if(permanent_flg){
          await this.seatModel.deleteAllSeatId(req.body.seat_id);
        }

        while(true){
          const seat = new SeatEntity();
          // user.id = req.body.id;
          seat.seat_id = req.body.seat_id;
          seat.seat_date = (permanent_flg)? "XXXX/XX/XX" : from_date;
          seat.user_name = req.body.user_name;
          
          
          await this.seatModel.create(seat)
            .then(
            )
            .catch((error) => {
                result = false;
                reject(error);
              }
            );
          if (!result){
            break;
          }
          if ((from_date == to_date) || permanent_flg){
            resolve();
            break;
          }
          from_p.setDate(from_p.getDate() + 1);
          from_date = formatDate(from_p);
        }
      });
    };
    main()
      .then(() => {
        this.seatModel.model.Commit();
        return this.controller.createSuccess(res)();
        }
      )
      .catch((error) => {
        this.seatModel.model.Rollback();
        return this.controller.editError(res)();
        }
      );
  }
  
  /**
   * 削除する
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  delete(req, res) {
    const seat_id = req.body.seat_id;
    const seat_date = req.body.seat_date;
    
    this.seatModel.delete(seat_id, seat_date)
      .then(this.controller.editSuccess(res))
      .catch((error) => {
        if(error.errorCode === 21) {
          // 削除対象がなかった場合は 404
          return this.controller.deleteError(res)();
        }
        else {
          return this.controller.editError(res)();
        }
      });
  }
}

module.exports = SeatsController;
