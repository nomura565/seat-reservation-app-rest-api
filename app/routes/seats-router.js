const express = require('express');

// ルータをモジュールとして作成する
const router = express.Router();

// コントローラを用意する
const SeatsController = require('../controllers/seats-controller');
const seatsController = new SeatsController();

// 全件取得（フロア）
router.get('/floor', (req, res) => {
  seatsController.findAllFloor(res);
});

// 全件取得
router.get('/', (req, res) => {
  seatsController.findAll(res);
});

// SeatDate を指定して複数件取得
router.post('/select', (req, res) => {
  seatsController.findBySeatDate(req, res);
});

// 登録
router.post('/insert', (req, res) => {
  seatsController.create(req, res);
});

// 削除
router.delete('/delete', (req, res) => {
  seatsController.delete(req, res);
});

// 更新
router.post('/update', (req, res) => {
  seatsController.update(req, res);
});

// YMと席ID を指定して複数件取得
router.post('/calendar', (req, res) => {
  seatsController.calendar(req, res);
});

// リプライ一覧取得
router.post('/replySelect', (req, res) => {
  seatsController.replySelect(req, res);
});

// リプライ登録
router.post('/replyInsert', (req, res) => {
  seatsController.replyInsert(req, res);
});

// 座席使用確認
router.post('/confirmSeatUse', (req, res) => {
  seatsController.confirmSeatUse(req, res);
});

// コメント一覧取得
router.post('/commentSelect', (req, res) => {
  seatsController.commentSelect(req, res);
});

module.exports = router;
