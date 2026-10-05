"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Award } from "lucide-react";
import MarkCompleteButton from "@/components/MarkCompleteButton";

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizPlayerProps {
  quizData: {
    questions: Question[];
  };
  courseId: string;
  lectureId: number;
  isCompleted: boolean;
}

export default function QuizPlayer({ quizData, courseId, lectureId, isCompleted }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // If no questions exist, show a placeholder
  if (!quizData?.questions || quizData.questions.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8">
        <Award size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">Quiz Time!</h2>
        <p>This quiz does not have any questions yet.</p>
        <div className="mt-8">
          <MarkCompleteButton courseId={courseId} lectureId={lectureId} isCompleted={isCompleted} />
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setIsSubmitted(true);
    if (selectedAnswer === question.correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0a0c16] overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#1e2130] rounded-2xl border border-white/10 p-8 shadow-2xl">
        
        {!showResults ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Quiz Question {currentQuestion + 1} of {quizData.questions.length}</h2>
              <span className="text-sm font-medium px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                Score: {score}
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-6 leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === question.correctAnswerIndex;
                
                let btnStyle = "bg-[#12141f] border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-gray-300";
                
                if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle = "bg-green-500/20 border-green-500 text-green-400";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-red-500/20 border-red-500 text-red-400";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-blue-500/20 border-blue-500 text-blue-400";
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="font-medium">{option}</span>
                    {isSubmitted && isCorrect && <CheckCircle size={20} className="text-green-500" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-colors"
                >
                  {currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'View Results'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 animate-in zoom-in duration-300">
            <Award size={64} className="mx-auto text-blue-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
            <p className="text-gray-400 mb-8">
              You scored <span className="text-white font-bold">{score}</span> out of <span className="text-white font-bold">{quizData.questions.length}</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-[#12141f] border border-white/10 hover:bg-white/5 text-white font-semibold rounded-lg transition-colors w-full sm:w-auto"
              >
                Retry Quiz
              </button>
              <MarkCompleteButton courseId={courseId} lectureId={lectureId} isCompleted={isCompleted} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
