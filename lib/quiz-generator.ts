import type { QuizSet, Question, DataItem } from "@/types/quiz"

// ランダムな整数を生成する関数
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ランダムな色を生成する関数
function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`
}

// ランダムなデータを生成する関数
function generateRandomData(categoryCount: number): DataItem[] {
  const categories = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
  const data: DataItem[] = []

  // 合計が100になるようにランダムな値を生成
  let remainingTotal = 100

  for (let i = 0; i < categoryCount - 1; i++) {
    // 最後のカテゴリ以外はランダムな値を割り当て
    const maxValue = remainingTotal - (categoryCount - i - 1) // 残りのカテゴリに最低1ずつ割り当てるための調整
    const value = getRandomInt(1, maxValue)

    data.push({
      name: categories[i],
      value: value,
    })

    remainingTotal -= value
  }

  // 最後のカテゴリには残りの値を割り当て
  data.push({
    name: categories[categoryCount - 1],
    value: remainingTotal,
  })

  return data
}

// 2カテゴリのデータに対する問題を生成
function generateTwoCategoryQuestion(data: DataItem[]): Question {
  const blueValue = data[1].value

  // 正解の値を設定
  const correctAnswer = `${blueValue}%`

  return {
    data,
    chartType: Math.random() < 0.5 ? "pie" : "bar",
    questionType: "percentage",
    questionParam: null,
    options: [], // 自由入力なので選択肢は空配列
    correctAnswer,
  }
}

// 3カテゴリ以上のデータに対する問題を生成
function generateMultiCategoryQuestion(data: DataItem[]): Question {
  // データを値でソート
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  // ランダムに何番目に大きい値を問う
  const rank = getRandomInt(1, Math.min(data.length, 3))
  const targetItem = sortedData[rank - 1]

  return {
    data,
    chartType: Math.random() < 0.5 ? "pie" : "bar",
    questionType: "rank",
    questionParam: rank,
    options: data.map((item) => item.name).sort(() => Math.random() - 0.5),
    correctAnswer: targetItem.name,
  }
}

// クイズセットを生成する関数
export function generateQuizSet(): QuizSet {
  const setId = getRandomInt(1, 10)
  const questions: Question[] = []

  // パーセンテージ問題を10問生成
  for (let i = 0; i < 10; i++) {
    // 2カテゴリのデータを生成
    const data = generateRandomData(2)
    questions.push(generateTwoCategoryQuestion(data))
  }

  // ランク問題を10問生成
  for (let i = 0; i < 10; i++) {
    // 3〜5カテゴリのデータを生成
    const categoryCount = getRandomInt(3, 5)
    const data = generateRandomData(categoryCount)
    questions.push(generateMultiCategoryQuestion(data))
  }

  // 問題をシャッフル
  questions.sort(() => Math.random() - 0.5)

  return {
    setId,
    questions,
  }
}

// txtファイルからデータを読み込む関数（実際の実装では使用）
export async function loadDataFromFile(filePath: string): Promise<any> {
  try {
    const response = await fetch(filePath)
    const text = await response.text()
    // テキストを解析してデータに変換するロジックをここに実装
    return JSON.parse(text)
  } catch (error) {
    console.error("Failed to load data from file:", error)
    // エラー時はランダムデータを返す
    return generateQuizSet()
  }
}

// データを保存するための関数（実装例）
export function saveDataToFile(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
