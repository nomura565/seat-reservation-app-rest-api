/**
 * Floor Entity
 */
class FloorEntity {
  /**
   * コンストラクタ
   * 
   * @param floor_id フロアID
   * @param floor_name フロア名
   * @param floor_map フロアマップ
   */
  constructor(floor_id, floor_name, floor_map) {
    this.key = floor_id;
    this.floor_id = floor_id;
    this.floor_name = floor_name;
    this.floor_map = floor_map;
  }
}

module.exports = FloorEntity;
