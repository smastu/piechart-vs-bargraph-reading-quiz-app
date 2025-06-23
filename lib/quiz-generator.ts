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

  // 各カテゴリの制限値を設定
  const minValuePerCategory = 5  // 5%以上
  const maxValuePerCategory = 49 // 50%未満
  
  // 全カテゴリに最低値を割り当て
  let remainingTotal = 100 - (categoryCount * minValuePerCategory)
  
  // 各カテゴリに最低値を設定
  for (let i = 0; i < categoryCount; i++) {
    data.push({
      name: categories[i],
      value: minValuePerCategory,
    })
  }

  // 残りの値をランダムに分配
  while (remainingTotal > 0) {
    const randomIndex = getRandomInt(0, categoryCount - 1)
    
    // そのカテゴリが最大値未満の場合のみ加算
    if (data[randomIndex].value < maxValuePerCategory) {
      data[randomIndex].value += 1
      remainingTotal -= 1
    }
    
    // 全てのカテゴリが最大値に達した場合は強制終了
    if (data.every(item => item.value >= maxValuePerCategory)) {
      break
    }
  }

  // 残りがある場合は適当に分配（通常は発生しない）
  if (remainingTotal > 0) {
    for (let i = 0; i < categoryCount && remainingTotal > 0; i++) {
      const addValue = Math.min(remainingTotal, maxValuePerCategory - data[i].value)
      data[i].value += addValue
      remainingTotal -= addValue
    }
  }

  return data
}

// 2カテゴリのデータに対する問題を生成
function generateTwoCategoryQuestion(data: DataItem[]): Question {
  // どちらのカテゴリを問うかをランダムに決定
  const targetIndex = getRandomInt(0, 1)
  const targetCategory = data[targetIndex].name
  const correctAnswer = `${data[targetIndex].value}%`

  return {
    data,
    chartType: Math.random() < 0.5 ? "pie" : "bar",
    questionType: "percentage",
    questionParam: null,
    options: [], // 自由入力なので選択肢は空配列
    correctAnswer,
    targetCategory,
  }
}

// 3カテゴリ以上のデータに対する問題を生成
function generateMultiCategoryQuestion(data: DataItem[]): Question {
  // データを値でソート
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  // ランダムに何番目に大きい値を問う
  const rank = getRandomInt(1, Math.min(data.length, 3))
  const targetItem = sortedData[rank - 1]

  // 選択肢はデータと同じものを使用（Aから順に表示）
  const options = data.map((item) => item.name)

  return {
    data,
    chartType: Math.random() < 0.5 ? "pie" : "bar",
    questionType: "rank",
    questionParam: rank,
    options,
    correctAnswer: targetItem.name,
  }
}

// クイズセットを生成する関数
export function generateQuizSet(): QuizSet {
  const setId = getRandomInt(1, 10)
  const questions: Question[] = []

  // 円グラフ用の問題を10問生成（パーセンテージ5問、ランク5問）
  for (let i = 0; i < 5; i++) {
    // パーセンテージ問題（円グラフ）
    const categoryCount = getRandomInt(3, 4)
    const data = generateRandomData(categoryCount)
    const percentageQuestion = generateTwoCategoryQuestion(data)
    percentageQuestion.chartType = "pie"
    questions.push(percentageQuestion)

    // ランク問題（円グラフ）
    const rankData = generateRandomData(4)
    const rankQuestion = generateMultiCategoryQuestion(rankData)
    rankQuestion.chartType = "pie"
    questions.push(rankQuestion)
  }

  // 帯グラフ用の問題を10問生成（パーセンテージ5問、ランク5問）
  for (let i = 0; i < 5; i++) {
    // パーセンテージ問題（帯グラフ）
    const categoryCount = getRandomInt(3, 4)
    const data = generateRandomData(categoryCount)
    const percentageQuestion = generateTwoCategoryQuestion(data)
    percentageQuestion.chartType = "bar"
    questions.push(percentageQuestion)

    // ランク問題（帯グラフ）
    const rankData = generateRandomData(4)
    const rankQuestion = generateMultiCategoryQuestion(rankData)
    rankQuestion.chartType = "bar"
    questions.push(rankQuestion)
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
