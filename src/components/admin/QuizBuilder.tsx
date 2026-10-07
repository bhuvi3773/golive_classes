"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

interface QuizBuilderProps {
  onSave: (quizData: { questions: any[] }) => void;
  initialData?: { questions: any[] };
}

export default function QuizBuilder({ onSave, initialData }: QuizBuilderProps) {
  const [questions, setQuestions] = useState(
    initialData?.questions?.length ? initialData.questions : [
      { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
    ]
  );

  const updateQuestion = (index: number, text: string) => {
    const newQ = [...questions];
    newQ[index].question = text;
    setQuestions(newQ);
  };

  const updateOption = (qIndex: number, optIndex: number, text: string) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex] = text;
    setQuestions(newQ);
  };

  const setCorrectAnswer = (qIndex: number, optIndex: number) => {
    const newQ = [...questions];
    newQ[qIndex].correctAnswerIndex = optIndex;
    setQuestions(newQ);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    onSave({ questions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-900">Create Quiz Questions</h4>
        <button 
          onClick={addQuestion}
          className="text-xs flex items-center gap-1 text-emerald-600 hover:text-blue-300"
        >
          <Plus size={14} /> Add Question
        </button>
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-[#12141f] p-4 rounded-lg border border-slate-200 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs text-slate-500">Question {qIndex + 1}</label>
              <input 
                type="text" 
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, e.target.value)}
                placeholder="What is the capital of France?"
                className="w-full bg-white border border-gray-600 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(qIndex)} className="text-slate-400 hover:text-red-400 mt-6">
                <Trash size={16} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-500">Options (Select the correct one)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name={`correct-${qIndex}`}
                    checked={q.correctAnswerIndex === optIndex}
                    onChange={() => setCorrectAnswer(qIndex, optIndex)}
                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-600"
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className={`flex-1 bg-white border rounded px-3 py-1.5 text-sm text-slate-900 focus:outline-none transition-colors ${q.correctAnswerIndex === optIndex ? 'border-blue-500/50' : 'border-gray-600'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
        >
          Save Quiz
        </button>
      </div>
    </div>
  );
}
