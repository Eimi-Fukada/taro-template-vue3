/**
 * 课程收费类型枚举
 */
export enum ChargeType {
  /**
   * 免费
   */
  Free = 0,
  /**
   * 收费
   */
  Paid = 1,
}

/**
 * 课程拥有状态枚举
 */
export enum OwnedStatus {
  /**
   * 未拥有
   */
  NotOwned = 0,
  /**
   * 已拥有
   */
  Owned = 1,
}

export interface CoursesItemProps {
  /**
   * 课程ID
   */
  id: number
  /**
   * 课程名称
   */
  title: string
  /**
   * 主理人姓名
   */
  principalName: string
  /**
   * 课程一级分类名称
   */
  categoryName: string
  /**
   * 课程头图ID
   */
  imageUrl: number
  /**
   * 课程头图URL
   */
  image: string
  /**
   * 章节数
   */
  chaptersNumber: number
  /**
   * 虚拟学习人数
   */
  virtualNumber: number
  /**
   * 实际加入学习人数
   */
  actualNumber: number
  /**
   * 收费形式: 0-免费, 1-收费
   */
  chargeType: ChargeType
  /**
   * 课程原价
   */
  originalPrice: number
  /**
   * 课程售价
   */
  sellingPrice: number
  /**
   * 排序
   */
  sortOrder: number
  /**
   * 拥有状态: 1-已拥有, 0-未拥有
   */
  owned: OwnedStatus
}
