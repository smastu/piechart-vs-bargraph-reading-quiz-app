"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { QuizResult } from "@/types/quiz"
import { Download, RotateCcw } from "lucide-react"

interface ResultsModalProps {
  results: QuizResult[]
  totalTime: number
  onClose: () => void
  onRestart: () => void
}

export function ResultsModal({ results, totalTime, onClose, onRestart }: ResultsModalProps) {
  const [open, setOpen] = useState(true)

  const correctAnswers = results.filter((r) => r.isCorrect).length
  const totalQuestions = results.length
  const accuracy = (correctAnswers / totalQuestions) * 100

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const downloadResults = () => {
    // CSVデータの作成
    const userName = results[0]?.userName || "匿名"
    const headers = "ユーザー名,問題番号,グラフタイプ,問題文,データ詳細,ユーザー回答,正解,正誤,問題所要時間(秒),全体正解率,全体所要時間(秒)\n"
    const csvData = results
      .map((result, index) => {
        // データをより読みやすい形式に変換
        const dataDetails = result.data.map(item => `${item.name}:${item.value}%`).join('; ')
        
        // その問題までの累積正解率を計算
        const resultsUpToThisPoint = results.slice(0, index + 1)
        const correctAnswersUpToThisPoint = resultsUpToThisPoint.filter(r => r.isCorrect).length
        const cumulativeAccuracy = (correctAnswersUpToThisPoint / resultsUpToThisPoint.length) * 100
        
        // その問題までの累積所要時間を計算
        const cumulativeTime = resultsUpToThisPoint.reduce((total, r) => total + r.timeSpent, 0)
        
        return `${userName},${result.questionNumber},${
          result.chartType === "pie" ? "円グラフ" : "帯グラフ"
        },"${result.questionText}","${dataDetails}",${result.userAnswer},${result.correctAnswer},${
          result.isCorrect ? "正解" : "不正解"
        },${(result.timeSpent / 1000).toFixed(2)},${cumulativeAccuracy.toFixed(1)}%,${(cumulativeTime / 1000).toFixed(1)}`
      })
      .join("\n")

    const csvContent = headers + csvData
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    // ダウンロードリンクの作成とクリック
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `quiz-results-${userName}-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">クイズ結果</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">
              {correctAnswers} / {totalQuestions}
            </div>
            <div className="text-lg text-muted-foreground">正解率: {accuracy.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-2">合計時間: {(totalTime / 1000).toFixed(1)}秒</div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">問題別結果:</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              {results.map((result, index) => (
                <div key={index} className="flex justify-between py-1 border-b last:border-0">
                  <span>問題 {result.questionNumber}</span>
                  <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                    {result.isCorrect ? "正解" : "不正解"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              閉じる
            </Button>
            <Button onClick={onRestart} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              もう一度挑戦
            </Button>
          </div>
          <Button onClick={downloadResults} variant="secondary" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            結果をダウンロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
