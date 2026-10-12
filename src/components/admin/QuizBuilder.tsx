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
    <div className="space-y-5 text-[#1B2E26]">
      <div className="flex items-center justify-between pb-2 border-b border-[#E9DFCC]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C]">Construct Assessment Questions</h4>
        <button 
          onClick={addQuestion}
          className="text-xs flex items-center gap-1 font-semibold text-[#24483C] hover:text-[#1B2E26]"
        >
          <Plus size={14} /> Add Question
        </button>
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E9DFCC] space-y-4 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#3D5A4C]">Question {qIndex + 1}</label>
              <input 
                type="text" 
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, e.target.value)}
                placeholder="Formulate assessment inquiry..."
                className="w-full bg-[#F8F4EC] border border-[#E9DFCC] rounded-xl px-3.5 py-2 text-xs text-[#1B2E26] focus:outline-none focus:border-[#24483C]"
              />
            </div>
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(qIndex)} className="text-[#556960] hover:text-[#8B381A] mt-6" title="Remove question">
                <Trash size={15} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#3D5A4C]">Options (Select the correct benchmark)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((opt: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name={`correct-${qIndex}`}
                    checked={q.correctAnswerIndex === optIndex}
                    onChange={() => setCorrectAnswer(qIndex, optIndex)}
                    className="w-4 h-4 text-[#24483C] accent-[#24483C] cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className={`flex-1 bg-[#F8F4EC] border rounded-xl px-3 py-1.5 text-xs text-[#1B2E26] focus:outline-none transition-colors ${q.correctAnswerIndex === optIndex ? 'border-[#24483C] bg-[#DCE6D8]/30 font-semibold' : 'border-[#E9DFCC]'}`}
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
          className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-xl transition-colors shadow-sm"
        >
          Save Assessment Battery
        </button>
      </div>
    </div>
  );
}
