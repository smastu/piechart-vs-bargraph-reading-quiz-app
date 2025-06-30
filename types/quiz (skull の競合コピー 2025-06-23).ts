export type ChartType = "pie" | "bar"
export type QuestionType = "percentage" | "rank"

export interface DataItem {
  name: string
  value: number
}

export interface Question {
  data: DataItem[]
  chartType: ChartType
  questionType: QuestionType
  questionParam: number | null // rankの場合は何番目かを示す数値、percentageの場合はnull
  options: string[]
  correctAnswer: string
  targetCategory?: string // percentage問題で問うカテゴリ名
}

export interface QuizSet {
  setId: number
  questions: Question[]
}

export interface QuizResult {
  questionNumber: number
  chartType: ChartType
  questionText: string // 問題文を追加
  data: DataItem[]
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeSpent: number // ミリ秒
  userName: string // ユーザー名を追加
}