# seat-reservation-app-rest-apiからのリクエストを受け取るREST-API

seat-reservation-app-rest-apiからのリクエストを受け取るREST-API。

## 使い方

```sh
$ npm install
$ npm start

サーバ起動 : http://localhost:3000/
```

| 機能 | メソッド | URL |
|---|---|---|
| フロアマスタ全件取得                | GET      | `http://localhost:3000/api/seats/floor`  |
| 座席情報全件取得(APIテスト用)       | GET      | `http://localhost:3000/api/seats/`       |
| 年月日,フロアID を指定して複数件取得 | POST     | `http://localhost:3000/api/seats/select` |
| 座席情報登録                       | POST     | `http://localhost:3000/api/seats/insert` |
| 座席情報削除                       | DELETE   | `http://localhost:3000/api/seats/delete` |

## 構造

ディレクトリ構成は以下のとおり。

```
seat-reservation-app-rest-api/
├ README.md                    説明ファイル
├ package.json                 利用する npm パッケージなどの情報
├ index.js                     エントリポイント。サーバの起動と DB の準備を行う
├ app/                         サーバ・DB を動作させるためのファイルは全てこの中
│ ├ db/                       DB (SQLite) 関連のファイルを置くディレクトリ
│ │ ├ db.js                  DB ファイルの生成とテーブル定義の準備を行う
│ │ └ sqlite3-database.db    サーバを起動すると db.js により生成される
│ │ └ sqlmark2.a5er          DB情報＋ER図
│ ├ routes/                   ルータ関連のディレクトリ
│ │ ├ router.js              API 別のルータの登録などを行うベースルータ
│ │ └ seats-router.js        Seats に関するルーティングの定義
│ ├ controllers/              ルータから呼ばれるコントローラクラスを置くディレクトリ
│ │ ├ controller.js          各コントローラクラスで共通的に利用する処理をまとめたクラス
│ │ └ seats-controller.js    Seats に関するコントローラ
│ ├ models/                   DB 接続を行うクラス (DAO) を置くディレクトリ
│ │ ├ model.js               各モデルクラスで共通的に利用する処理をまとめたクラス
│ │ ├ model-error.js         DB 操作時のエラー情報を保持するためのオブジェクト
│ │ └ seat-model.js          Seats に関するモデル
│ └ entities/                 コントローラ・モデル間でデータをやり取りする際のクラス (DTO) を置くディレクトリ
│    └ floor-entity.js         Floor に関するエンティティ
│    └ seat-entity.js         Seats に関するエンティティ
```

`index.js` がエントリポイント。サーバを起動し、`db.js` にDB ファイルを用意させ、`router.js` を呼び出してルーティングの定義を行わせる。

特定の URL にアクセスすると、Router から Controller が呼び出される。Controller でリクエスト情報が整理され、DB 操作を行う Model クラスが呼び出される。Controller と Model 間のデータやり取りのために、Entity クラスを利用している。

## DB構造

| 論理名 | 物理名 | 説明 |
|---|---|---|
| フロアマスタ    | floor_master      | フロア（オフィス）のマスタテーブル  |
| 座席情報        | seat_info      | 座席の情報テーブル　座席マスタと座席IDで1:Nで紐づく　フロアと座席日付で絞り込むと一意になる  |
| 座席マスタ      | seat_master      | 座席のマスタテーブル  |

## フロアの追加手順

- フロアマスタで新規行を追加
- office.pngと同じサイズのフロア画像を用意する
- seat-reservation-app-front/publicに配置する

## 座席の追加手順

- seat-reservation-app-front/を起動し、追加したい箇所をクリックする
- コンソールに緯度、経度が出力されるので座席情報に追加する
