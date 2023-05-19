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
   * ID を指定して1件取得する
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  findById(req, res) {
    const id = req.params.id;
    
    this.seatModel.findById(id)
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
    const main = async () => {
      let from_date = req.body.from_date;
      let to_date = req.body.to_date;

      let from_p = parse(from_date, "yyyy/MM/dd", new Date());
      let p = Promise.resolve();
      while(true){
        const seat = new SeatEntity();
        // user.id = req.body.id;
        seat.seat_id = req.body.seat_id;
        seat.seat_date = from_date;
        seat.user_name = req.body.user_name;
        
        
        this.seatModel.create(seat)
          .then(this.controller.createSuccess(res))
          .catch(this.controller.editError(res));
        if (from_date == to_date){
          break;
        }
        from_p.setDate(from_p.getDate() + 1);
        from_date = formatDate(from_p);
      }
      await p;
      this.controller.createSuccess(res);
    };
    main();
  }
  
  /**
   * 登録 or 更新する
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  update(req, res) {
    const seat = new SeatEntity();
    // user.id = req.body.id;
    seat.seat_id = req.body.seat_id;
    seat.seat_date = req.body.seat_date;
    seat.user_name = req.body.user_name;
    
    this.seatModel.update(seat)
      .then(this.controller.editSuccess(res))
      .catch(this.controller.editError(res));
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
