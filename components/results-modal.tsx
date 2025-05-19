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
    const headers = "問題番号,グラフタイプ,データ,ユーザー回答,正解,正誤,所要時間(ms)\n"
    const csvData = results
      .map((result) => {
        return `${result.questionNumber},${
          result.chartType === "pie" ? "円グラフ" : "帯グラフ"
        },"${JSON.stringify(result.data)}",${result.userAnswer},${result.correctAnswer},${
          result.isCorrect ? "正解" : "不正解"
        },${result.timeSpent}`
      })
      .join("\n")

    const csvContent = headers + csvData
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    // ダウンロードリンクの作成とクリック
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `quiz-results-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
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

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="sm:w-full">
            閉じる
          </Button>
          <Button onClick={onRestart} className="sm:w-full">
            <RotateCcw className="mr-2 h-4 w-4" />
            もう一度挑戦
          </Button>
          <Button onClick={downloadResults} variant="secondary" className="sm:w-full">
            <Download className="mr-2 h-4 w-4" />
            結果をダウンロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
