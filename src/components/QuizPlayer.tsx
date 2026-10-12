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
      <div className="w-full h-full flex flex-col items-center justify-center text-[#556960] p-8 bg-[#F8F4EC]">
        <Award size={48} className="mb-4 text-[#C96F4A] opacity-60" />
        <h2 className="font-serif text-xl font-bold text-[#1B2E26] mb-2">Academic Assessment</h2>
        <p className="text-sm">This assessment module does not have any questions published yet.</p>
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
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#F8F4EC] overflow-y-auto text-[#1B2E26]">
      <div className="max-w-2xl w-full bg-[#FAF7F0] rounded-2xl border border-[#E9DFCC] p-8 shadow-sm">
        
        {!showResults ? (
          <>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E9DFCC]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C96F4A]">Evaluation</span>
                <h2 className="font-serif text-lg font-bold text-[#1B2E26]">Question {currentQuestion + 1} of {quizData.questions.length}</h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-[#DCE6D8] text-[#24483C] rounded-full">
                Score: {score}
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#1B2E26] mb-6 leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === question.correctAnswerIndex;
                
                let btnStyle = "bg-[#F8F4EC] border-[#E9DFCC] hover:border-[#24483C]/40 text-[#1B2E26]";
                
                if (isSubmitted) {
                  if (isCorrect) {
                    btnStyle = "bg-[#DCE6D8] border-[#24483C] text-[#24483C] font-semibold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-[#C96F4A]/10 border-[#C96F4A] text-[#8B381A]";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-[#DCE6D8] border-[#24483C] text-[#24483C] font-semibold";
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isSubmitted && isCorrect && <CheckCircle size={18} className="text-[#24483C]" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle size={18} className="text-[#C96F4A]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswer === null}
                  className="px-6 py-3 bg-[#24483C] hover:bg-[#1B2E26] disabled:opacity-50 disabled:cursor-not-allowed text-[#F8F4EC] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                >
                  {currentQuestion < quizData.questions.length - 1 ? 'Next Question' : 'View Assessment Results'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#DCE6D8] text-[#24483C] flex items-center justify-center mx-auto mb-4 border border-[#24483C]/20 shadow-sm">
              <Award size={36} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#1B2E26] mb-2">Assessment Concluded</h2>
            <p className="text-[#556960] mb-8 text-sm">
              You scored <span className="text-[#24483C] font-bold">{score}</span> out of <span className="text-[#1B2E26] font-bold">{quizData.questions.length}</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 bg-[#FAF7F0] border border-[#E9DFCC] hover:bg-[#E9DFCC]/50 text-[#1B2E26] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm w-full sm:w-auto"
              >
                Reattempt Assessment
              </button>
              <MarkCompleteButton courseId={courseId} lectureId={lectureId} isCompleted={isCompleted} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
