import { ChargeType, OwnedStatus } from '../index/type'

export interface ChapterPlayUrl {
  /**
   * 章节名称
   */
  chapterName: string
  /**
   * 播放地址, 防盗链签名过
   */
  playUrl: string
  /**
   * 已播放时长
   */
  playedDuration: number
}

/**
 * 章节详细信息接口
 */
export interface ChapterDetail {
  /**
   * 插入时间
   */
  insertTime?: string

  /**
   * 更新时间
   */
  updateTime?: string

  /**
   * 主键ID
   */
  id?: string

  /**
   * 章节ID
   */
  chapterId: string

  /**
   * 课程ID
   */
  courseId: number

  /**
   * 章节名称
   */
  title?: string

  /**
   * 音频链接
   */
  linkAudio?: string

  /**
   * 音频总时长（单位：秒）
   */
  totalDuration?: number

  /**
   * 章节文稿，富文本
   */
  manuscript?: string

  /**
   * 收费形式: 0-免费, 1-收费
   */
  chargeType?: ChargeType

  /**
   * 是否拥有该课程: 1-已拥有, 0-未拥有
   */
  owned?: OwnedStatus

  /**
   * 排序
   */
  sortOrder?: number

  /**
   * 留言数量
   */
  commentsCount?: number

  /**
   * 审核状态: 0-待审核, 1-审核通过, 2-审核未通过
   */
  auditStatus?: number

  /**
   * 云点播返回的文件ID
   */
  fileId?: string

  /**
   * 章节名称
   */
  courseName?: string

  /**
   * 课程图片
   */
  courseImageUrl?: string
}

/**
 * 审核状态枚举
 */
export enum AuditStatus {
  /**
   * 待审核
   */
  Pending = 0,
  /**
   * 审核通过
   */
  Approved = 1,
  /**
   * 审核未通过
   */
  Rejected = 2,
}
