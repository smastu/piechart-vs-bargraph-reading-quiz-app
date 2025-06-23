"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { PieChart, BarChart } from "@/components/charts"
import { QuizQuestion } from "@/components/quiz-question"
import { ResultsModal } from "@/components/results-modal"
import { generateQuizSet } from "@/lib/quiz-generator"
import type { QuizSet, QuizResult } from "@/types/quiz"

export default function Home() {
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [results, setResults] = useState<QuizResult[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("")
  const [questionStartTime, setQuestionStartTime] = useState(0)

  // 新しいクイズセットを生成
  const startNewQuiz = () => {
    setIsLoading(true)
    try {
      const newQuizSet = generateQuizSet()
      setQuizSet(newQuizSet)
      setCurrentQuestionIndex(0)
      setQuizStarted(true)
      setQuizCompleted(false)
      setStartTime(Date.now())
      setQuestionStartTime(Date.now())
      setResults([])
      setSelectedAnswer(null)
      setIsAnswered(false)
    } catch (error) {
      console.error("クイズの生成中にエラーが発生しました:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 回答を提出
  const submitAnswer = () => {
    if (!quizSet || selectedAnswer === null) return

    const currentQuestion = quizSet.questions[currentQuestionIndex]
    let isCorrect = false

    if (currentQuestion.questionType === "percentage") {
      // パーセンテージ問題の場合、許容範囲内であれば正解
      const userAnswerValue = Number.parseFloat(selectedAnswer.replace("%", ""))
      const correctAnswerValue = Number.parseFloat(currentQuestion.correctAnswer.replace("%", ""))

      // 正解との差が5%以内なら正解とする
      const tolerance = 5
      isCorrect = Math.abs(userAnswerValue - correctAnswerValue) <= tolerance
    } else {
      // ランク問題の場合は完全一致で判定
      isCorrect = selectedAnswer === currentQuestion.correctAnswer
    }

    const result: QuizResult = {
      questionNumber: currentQuestionIndex + 1,
      chartType: currentQuestion.chartType,
      questionText: currentQuestion.questionType === "percentage" 
        ? `${currentQuestion.targetCategory ?? "この領域"}は全体の何パーセントぐらいだと思いますか？`
        : `${currentQuestion.questionParam}番目に割合が大きいと思う領域はどれですか？`,
      data: currentQuestion.data,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeSpent: Date.now() - questionStartTime,
      userName: userName,
    }

    setResults([...results, result])
    setIsAnswered(true)
  }

  // 次の問題へ進む
  const nextQuestion = () => {
    if (!quizSet) return

    if (currentQuestionIndex < quizSet.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setQuestionStartTime(Date.now())
    } else {
      setQuizCompleted(true)
      setShowResults(true)
    }
  }

    const resetQuiz = () => {
        setQuizSet(null);
        setCurrentQuestionIndex(0);
        setQuizStarted(false);
        setQuizCompleted(false);
        setStartTime(0);
        setResults([]);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setShowResults(false);
    };

  // 現在の問題を取得
  const currentQuestion = quizSet?.questions[currentQuestionIndex]

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">グラフ読み取りクイズ</h1>

      {!quizStarted ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">グラフ読み取りクイズへようこそ！</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              このクイズでは、円グラフまたは帯グラフが表示され、そのグラフから情報を読み取って回答していただきます。
            </p>
            <p className="mb-4">
              データの種類が2つの場合は、パーセンテージを推測する問題です。
              <br />
              データの種類が3つ以上の場合は、n番目に大きい領域を特定する問題です。
            </p>
            <p className="mb-4">全20問あります。準備ができたらスタートボタンを押してください。</p>
            
            <div className="mb-6">
              <label htmlFor="userName" className="block text-sm font-medium mb-2">
                ユーザー名を入力してください（結果出力に使用されます）
              </label>
              <Input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="ユーザー名を入力"
                className="w-full max-w-xs mx-auto"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={startNewQuiz} disabled={isLoading || userName.trim() === ""}>
              {isLoading ? "準備中..." : "クイズをスタート"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="max-w-4xl mx-auto">
          {!quizCompleted && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="text-lg font-medium">
                  問題 {currentQuestionIndex + 1} / {quizSet?.questions.length}
                </div>
                <div className="text-sm text-muted-foreground">セット {quizSet?.setId}</div>
              </div>

              <Progress value={(currentQuestionIndex / (quizSet?.questions.length || 1)) * 100} className="mb-6" />

              {currentQuestion && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-center">
                      {currentQuestion.chartType === "pie" ? "円グラフ" : "帯グラフ"}を読み取ってください
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    {currentQuestion.chartType === "pie" ? (
                      <PieChart data={currentQuestion.data} />
                    ) : (
                      <BarChart data={currentQuestion.data} />
                    )}
                  </CardContent>
                </Card>
              )}

              {currentQuestion && (
                <QuizQuestion
                  question={currentQuestion}
                  selectedAnswer={selectedAnswer}
                  setSelectedAnswer={setSelectedAnswer}
                  isAnswered={isAnswered}
                />
              )}

              <div className="flex justify-center mt-6 gap-4">
                {!isAnswered ? (
                  <Button size="lg" onClick={submitAnswer} disabled={selectedAnswer === null || !currentQuestion}>
                    回答する
                  </Button>
                ) : (
                  <Button size="lg" onClick={nextQuestion}>
                    次の問題へ
                  </Button>
                )}
              </div>
            </>
          )}

          {showResults && (
            <ResultsModal
              results={results}
              totalTime={Date.now() - startTime}
              onClose={() => setShowResults(false)}
              onRestart={resetQuiz}
            />
          )}
        </div>
      )}
    </main>
  )
}