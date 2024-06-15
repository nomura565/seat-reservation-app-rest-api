const Controller = require('./controller');
const SeatModel = require('../models/seat-model');
const SeatEntity = require('../entities/seat-entity');

const format = require('date-fns/format');
const parse = require('date-fns/parse');
const ja = require('date-fns/locale/ja');

const Log4js = require("log4js");
// 設定ファイルの読み込み
Log4js.configure("./././log-config.json");

const formatDate = (date) => {
  const d = new Date(date.toString());
  return format(
    d,
    "yyyy/MM/dd", {
    locale: ja,
  });
}

const logStart = (target) => {
  const logger = Log4js.getLogger();
  logger.info(target + " start");
}

const loginfo = (target, message) => {
  const logger = Log4js.getLogger();
  logger.info(target + " " + message);
}

const logEnd = (target) => {
  const logger = Log4js.getLogger();
  logger.info(target + " end");
}

const logError = (target, error) => {
  const logger = Log4js.getLogger();
  if (error.constructor.name == MODEL_ERROR_CLASS) {
    logger.error(target + " errorCode:" + error.errorCode);
    logger.error(target + " errorMessage:" + error.errorMessage);
  } else {
    logger.error(target + " error:" + error.message);
  }
}

const getIpAddress = (req) => {
  return req.headers['x-forwarded-for'] || 
    (req.connection && req.connection.remoteAddress) || 
    (req.connection.socket && req.connection.socket.remoteAddress) || 
    (req.socket && req.socket.remoteAddress) || 
    '0.0.0.0';
}

const isInvalidDate = (date) => Number.isNaN(date.getTime());

const MODEL_ERROR_CLASS = "ModelError";

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
    const logTarget = "findAllFloor";
    logStart(logTarget);
    this.seatModel.findAllFloor()
      .then((result) => {
        logEnd(logTarget);
        return this.controller.findSuccess(res)(result);
      })
      .catch((error) => {
        logError(logTarget, error);
        return this.controller.findError(res)(error);
      });
  }

  /**
   * 全件取得する
   * 
   * @param res レスポンス
   */
  findAll(res) {
    logStart(logTarget);
    this.seatModel.findAll()
      .then((result) => {
        logEnd(logTarget);
        return this.controller.findSuccess(res)(result);
      })
      .catch((error) => {
        logError(logTarget, error);
        return this.controller.findError(res)(error);
      });
  }

  /**
  * seat_date を指定して複数件取得する
  * 
  * @param req リクエスト
  * @param res レスポンス
  */
  findBySeatDate(req, res) {
    const logTarget = "findBySeatDate";
    logStart(logTarget);
    loginfo(logTarget, "req.body.seat_date:" + req.body.seat_date);
    loginfo(logTarget, "req.body.floor_id:" + req.body.floor_id);
    loginfo(logTarget, "IpAddress:" + getIpAddress(req));
    const seat_date = req.body.seat_date;
    const floor_id = req.body.floor_id;

    this.seatModel.findBySeatDate(seat_date, floor_id)
      .then((result) => {
        logEnd(logTarget);
        return this.controller.findSuccess(res)(result);
      })
      .catch((error) => {

        return this.controller.findError(res)(error);
      });
  }

  /**
   * 登録する
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  create(req, res) {
    const logTarget = "create";
    logStart(logTarget);
    loginfo(logTarget, "req.body.from_date:" + req.body.from_date);
    loginfo(logTarget, "req.body.to_date:" + req.body.to_date);
    loginfo(logTarget, "req.body.permanent_flg:" + req.body.permanent_flg);
    loginfo(logTarget, "req.body.seat_id:" + req.body.seat_id);
    loginfo(logTarget, "req.body.user_name:" + req.body.user_name);
    loginfo(logTarget, "IpAddress:" + getIpAddress(req));
    let result = true;
    this.seatModel.model.BeginTransaction();
    const main = async () => {
      return new Promise(async (resolve, reject) => {
        let from_date = req.body.from_date;
        let to_date = req.body.to_date;
        let permanent_flg = req.body.permanent_flg;
        let from_p;
        let to_p;

        if (typeof permanent_flg === 'undefined') {
          const error = { message: "permanent_flg is undefined" };
          logError(logTarget + " permanent_flg", error);
          reject(error);
          return;
        }

        try {
          from_p = parse(from_date, "yyyy/MM/dd", new Date());
          if (isInvalidDate(from_p)) {
            throw new Error("from_date is invalid date");
          }
          to_p = parse(to_date, "yyyy/MM/dd", new Date());
          if (isInvalidDate(to_p)) {
            throw new Error("to_date is invalid date");
          }
        } catch (e) {
          logError(logTarget + " date parse", error);
          reject(e);
          return;
        }

        if (permanent_flg) {
          await this.seatModel.deleteAllSeatId(req.body.seat_id);
        }

        while (true) {
          const seat = new SeatEntity();
          // user.id = req.body.id;
          seat.seat_id = req.body.seat_id;
          seat.seat_date = (permanent_flg) ? "XXXX/XX/XX" : from_date;
          seat.user_name = req.body.user_name;
          seat.image_data = req.body.image_data;
          seat.comment = req.body.comment;

          await this.seatModel.create(seat)
            .then()
            .catch((error) => {
              logError(logTarget + " seatModel.create error", error);
              result = false;
              reject(error);
            }
            );
          if (!result) {
            break;
          }
          if ((from_date == to_date) || permanent_flg) {
            resolve();
            break;
          }
          try {
            from_p.setDate(from_p.getDate() + 1);
            from_date = formatDate(from_p);
          } catch (e) {
            logError(logTarget + " date format", error);
            reject(e);
            return;
          }
        }
      });
    };
    main()
      .then((result) => {
        logEnd(logTarget);
        this.seatModel.model.Commit();
        return this.controller.createSuccess(res)(result);
      }
      )
      .catch((error) => {
        logError(logTarget + " rollback", error);
        this.seatModel.model.Rollback();
        return this.controller.editError(res)(error);
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
    const logTarget = "delete";
    logStart(logTarget);
    loginfo(logTarget, "req.body.seat_date:" + req.body.seat_date);
    loginfo(logTarget, "req.body.to_date:" + req.body.to_date);
    loginfo(logTarget, "req.body.user_name:" + req.body.user_name);
    loginfo(logTarget, "req.body.seat_id:" + req.body.seat_id);
    loginfo(logTarget, "IpAddress:" + getIpAddress(req));
    loginfo(logTarget, "req.body.used_name:" + req.body.used_name);
    const seat_id = req.body.seat_id;
    const seat_date = req.body.seat_date;
    const to_date = req.body.to_date;
    const user_name = req.body.user_name;
    this.seatModel.model.BeginTransaction();
    const main = async () => {
      return new Promise(async (resolve, reject) => {
        let seat_p;
        let to_p;
        try {
          seat_p = parse(seat_date, "yyyy/MM/dd", new Date());
          if (isInvalidDate(seat_p)) {
            throw new Error("seat_date is invalid date");
          }
          to_p = parse(to_date, "yyyy/MM/dd", new Date());
          if (isInvalidDate(to_p)) {
            throw new Error("to_date is invalid date");
          }
        } catch (e) {
          logError(logTarget + " date parse", error);
          reject(e);
          return;
        }

        await this.seatModel.deleteReplyInfo(seat_id, seat_date, to_date, user_name)
          .then()
          .catch((error) => {
            logError(logTarget + " seatModel.deleteReplyInfo", error);
            reject(error);
          });
        await this.seatModel.delete(seat_id, seat_date, to_date, user_name)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            logError(logTarget + " seatModel.delete", error);
            reject(error);
          });
      });
    };
    main()
      .then((result) => {
        logEnd(logTarget);
        this.seatModel.model.Commit();
        return this.controller.editSuccess(res)(result);
      }
      )
      .catch((error) => {
        logError(logTarget + " rollback", error);
        this.seatModel.model.Rollback();
        return this.controller.editError(res)(error);
      }
      );
  }

  /**
   * 座席マスタを登録、更新する
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  update(req, res) {
    const logTarget = "update";
    logStart(logTarget);
    loginfo(logTarget, "req.body.seat_list.length:" + req.body.seat_list.length);
    loginfo(logTarget, "req.body.floor_id:" + req.body.floor_id);
    let result = true;
    let seat_list = req.body.seat_list;
    let floor_id = req.body.floor_id;

    this.seatModel.model.BeginTransaction();
    const main = async () => {
      return new Promise(async (resolve, reject) => {

        await this.seatModel.deleteAllSeatMaster(floor_id);
        for (var i = 0; i < seat_list.length; i++) {
          const seat = new SeatEntity();
          // user.id = req.body.id;
          seat.seat_id = seat_list[i].seat_id;
          seat.lat = seat_list[i].lat;
          seat.lng = seat_list[i].lng;
          seat.seat_name = seat_list[i].seat_name;
          seat.tooltip_direction = seat_list[i].tooltip_direction;

          loginfo(logTarget, "seat.seat_id:" + seat.seat_id);
          loginfo(logTarget, "seat.lat:" + seat.lat);
          loginfo(logTarget, "seat.lng:" + seat.lng);
          loginfo(logTarget, "seat.seat_name:" + seat.seat_name);
          loginfo(logTarget, "seat.tooltip_direction:" + seat.tooltip_direction);

          await this.seatModel.insert(seat, floor_id)
            .then()
            .catch((error) => {
              logError(logTarget + " seatModel.insert", error);
              result = false;
              reject(error);
            }
            );

          if (!result) {
            break;
          }
          if (i == seat_list.length - 1) {
            resolve();
            break;
          }
        }
      });
    };
    main()
      .then((result) => {
        logEnd(logTarget);
        this.seatModel.model.Commit();
        return this.controller.createSuccess(res)(result);
      }
      )
      .catch((error) => {
        logError(logTarget + " rollback", error);
        this.seatModel.model.Rollback();
        return this.controller.editError(res)(error);
      }
      );
  }

  /**
   * YMと席ID を指定して複数件取得
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  calendar(req, res) {
    const logTarget = "calendar";
    logStart(logTarget);
    loginfo(logTarget, "req.body.seat_id:" + req.body.seat_id);
    loginfo(logTarget, "req.body.date_ym:" + req.body.date_ym);
    loginfo(logTarget, "req.body.date_ym_next:" + req.body.date_ym_next);
    loginfo(logTarget, "req.body.date_ym_prev:" + req.body.date_ym_prev);
    const seat_id = req.body.seat_id;
    const date_ym = req.body.date_ym;
    const date_ym_next = req.body.date_ym_next;
    const date_ym_prev = req.body.date_ym_prev;

    this.seatModel.calendar(seat_id, date_ym, date_ym_next, date_ym_prev)
      .then((result) => {
        logEnd(logTarget);
        return this.controller.findSuccess(res)(result);
      })
      .catch((error) => {
        logError(logTarget, error);
        return this.controller.findError(res)(error);
      });
  }

  /**
   * リプライ一覧取得
   * 
   * @param req リクエスト
   * @param res レスポンス
   */
  replySelect(req, res) {
    const logTarget = "replySelect";
    logStart(logTarget);
    loginfo(logTarget, "req.body.seat_id:" + req.body.seat_id);
    loginfo(logTarget, "req.body.seat_date:" + req.body.seat_date);
    const seat_id = req.body.seat_id;
    const seat_date = req.body.seat_date;

    this.seatModel.replySelect(seat_id, seat_date)
      .then((result) => {
        logEnd(logTarget);
        return this.controller.findSuccess(res)(result);
      })
      .catch((error) => {
        logError(logTarget, error);
        return this.controller.findError(res)(error);
      });
  }

  /**
 * リプライ登録
 * 
 * @param req リクエスト
 * @param res レスポンス
 */
  replyInsert(req, res) {
    const logTarget = "replyInsert";
    logStart(logTarget);
    loginfo(logTarget, "req.body.seat_id:" + req.body.seat_id);
    loginfo(logTarget, "req.body.seat_date:" + req.body.seat_date);
    loginfo(logTarget, "req.body.comment:" + req.body.comment);
    loginfo(logTarget, "IpAddress:" + getIpAddress(req));
    const seat_id = req.body.seat_id;
    const seat_date = req.body.seat_date;
    const comment = req.body.comment;

    this.seatModel.replyInsert(seat_id, seat_date, comment)
      .then((result) => {
        logEnd(logTarget);
        return this.controller.createSuccess(res)(result);
      })
      .catch((error) => {
        logError(logTarget, error);
        return this.controller.editError(res)(error);
      });
  }
}

module.exports = SeatsController;
