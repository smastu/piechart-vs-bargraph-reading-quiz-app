"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle } from "lucide-react"
import type { Question } from "@/types/quiz"

interface QuizQuestionProps {
  question: Question
  selectedAnswer: string | null
  setSelectedAnswer: (answer: string) => void
  isAnswered: boolean
}

export function QuizQuestion({ question, selectedAnswer, setSelectedAnswer, isAnswered }: QuizQuestionProps) {
  const [inputValue, setInputValue] = useState("")
  const [inputError, setInputError] = useState<string | null>(null)

  // question が undefined の場合は早期リターン
  if (!question) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>問題の読み込み中...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>問題データを準備しています。しばらくお待ちください。</p>
        </CardContent>
      </Card>
    )
  }

  const isPercentageQuestion = question.questionType === "percentage"

  // パーセンテージ問題の正解判定関数
  const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
    if (question.questionType === "percentage") {
      const userAnswerValue = Number.parseFloat(userAnswer.replace("%", ""))
      const correctAnswerValue = Number.parseFloat(correctAnswer.replace("%", ""))
      const tolerance = 5
      const difference = Math.abs(userAnswerValue - correctAnswerValue)
      const isCorrect = difference <= tolerance

      // デバッグ情報をコンソールに出力
      console.log("QuizQuestionでの正解判定:", {
        userAnswer,
        userAnswerValue,
        correctAnswer,
        correctAnswerValue,
        difference,
        tolerance,
        isCorrect
      })

      return isCorrect
    } else {
      return userAnswer === correctAnswer
    }
  }

  // 入力値が変更されたときの処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // デバッグ情報をコンソールに出力
    console.log("入力値の変更:", {
      rawValue: value,
      parsedValue: Number.parseFloat(value),
      isNaN: isNaN(Number.parseFloat(value))
    })

    // 入力値の検証
    if (value === "") {
      setInputError(null)
      setSelectedAnswer("") // 空の場合は回答をクリア
    } else {
      const numValue = Number.parseFloat(value)
      if (isNaN(numValue)) {
        setInputError("数値を入力してください")
        setSelectedAnswer("") // 無効な値の場合は回答をクリア
      } else if (numValue < 0 || numValue > 100) {
        setInputError("0から100の間の数値を入力してください")
        setSelectedAnswer("") // 範囲外の値の場合は回答をクリア
      } else {
        setInputError(null)
        // 有効な値の場合は即座に回答として設定
        const answerWithPercent = `${numValue}%`
        setSelectedAnswer(answerWithPercent)
        console.log("回答として設定:", answerWithPercent)
      }
    }
  }

  // 入力フィールドでEnterキーが押されたときの処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // フォーム送信を防止
    }
  }

  // コンポーネントがマウントされたときに実行
  useEffect(() => {
    // 質問が変わったときに入力値をリセット
    setInputValue("")
    setInputError(null)
  }, [question])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isPercentageQuestion
            ? `${question.targetCategory ?? "この領域"}は全体の何パーセントぐらいだと思いますか？`
            : `${question.questionParam}番目に割合が大きいと思う領域はどれですか？`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPercentageQuestion ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="パーセンテージを入力（例: 25）"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isAnswered}
                className="max-w-[200px]"
              />
              <span className="flex items-center">%</span>
            </div>

            {inputError && <p className="text-sm text-red-500">{inputError}</p>}
          </div>
        ) : (
          <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer} className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 rounded-md border p-3 ${
                  isAnswered && option === question.correctAnswer
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : isAnswered && option === selectedAnswer
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : ""
                }`}
              >
                <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  {option}
                </Label>
                {isAnswered && option === question.correctAnswer && <CheckCircle className="h-5 w-5 text-green-500" />}
                {isAnswered && option === selectedAnswer && option !== question.correctAnswer && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </RadioGroup>
        )}

        {isAnswered && (
          <Alert
            className={`mt-4 ${
              isAnswerCorrect(selectedAnswer || "", question.correctAnswer)
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-red-500 bg-red-50 dark:bg-red-950/20"
            }`}
          >
            <AlertDescription>
              {isAnswerCorrect(selectedAnswer || "", question.correctAnswer)
                ? `正解です！実際の値は「${question.correctAnswer}」でした。`
                : `不正解です。正解は「${question.correctAnswer}」です。`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
