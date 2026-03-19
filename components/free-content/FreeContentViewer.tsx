"use client";

import { useState } from "react";
import SafeMarkdown from "@/components/shared/SafeMarkdown";
import { cn } from "@/lib/utils";
import LatexRenderer from "@/components/shared/LatexRenderer";
import { CheckCircle2, XCircle, Copy } from "lucide-react";
import type { FreeContentType } from "@/lib/types";

interface FreeContentViewerProps {
  content: any;
  onSubmitAnswer?: (answer: string, isCorrect?: boolean) => void;
  isCompleted?: boolean;
  previousAnswer?: string;
  isCorrect?: boolean;
}

export default function FreeContentViewer({
  content,
  onSubmitAnswer,
  isCompleted,
  previousAnswer,
  isCorrect,
}: FreeContentViewerProps) {
  if (!content) return null;
  const data = content.content_data || {};
  const type = content.content_type as FreeContentType;

  switch (type) {
    case "markdown":
      return (
        <div className="prose prose-invert prose-indigo max-w-none">
          <SafeMarkdown>{String(data.body ?? "")}</SafeMarkdown>
        </div>
      );

    case "video": {
      const url = data.url || "";
      const videoId = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|$)/)?.[1];
      return (
        <div className="space-y-4">
          {videoId && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
          {data.caption && <p className="text-slate-400">{data.caption}</p>}
        </div>
      );
    }

    case "key_points":
      return (
        <div className="space-y-4">
          <ul className="space-y-3">
            {(data.points || []).map((p: string, i: number) => (
              <li
                key={i}
                className="flex gap-3 animate-in fade-in slide-in-from-left-2"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-indigo-400 font-bold">•</span>
                <span className="text-slate-300">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "mcq":
      return (
        <McqViewer
          data={data}
          onSubmitAnswer={onSubmitAnswer}
          isCompleted={isCompleted}
          previousAnswer={previousAnswer}
          isCorrect={isCorrect}
        />
      );

    case "short_answer":
      return (
        <ShortAnswerViewer
          data={data}
          onSubmitAnswer={onSubmitAnswer}
          isCompleted={isCompleted}
          previousAnswer={previousAnswer}
          isCorrect={isCorrect}
        />
      );

    case "true_false":
      return (
        <TrueFalseViewer
          data={data}
          onSubmitAnswer={onSubmitAnswer}
          isCompleted={isCompleted}
          previousAnswer={previousAnswer}
          isCorrect={isCorrect}
        />
      );

    case "fill_blank":
      return (
        <FillBlankViewer
          data={data}
          onSubmitAnswer={onSubmitAnswer}
          isCompleted={isCompleted}
          previousAnswer={previousAnswer}
          isCorrect={isCorrect}
        />
      );

    case "flashcard":
      return <FlashcardViewer data={data} />;

    case "match_following":
      return (
        <MatchFollowingViewer
          data={data}
          onSubmitAnswer={onSubmitAnswer}
          isCompleted={isCompleted}
          previousAnswer={previousAnswer}
          isCorrect={isCorrect}
        />
      );

    case "image_diagram":
      return (
        <div className="space-y-4">
          {data.image_url && (
            <img
              src={data.image_url}
              alt={data.caption}
              className="w-full rounded-xl"
            />
          )}
          {data.caption && <p className="text-slate-400">{data.caption}</p>}
          {data.description && (
            <div className="prose prose-invert prose-sm">
              <SafeMarkdown>{String(data.description ?? "")}</SafeMarkdown>
            </div>
          )}
        </div>
      );

    case "latex_formula":
      return (
        <div className="space-y-4 font-bangla">
          <div className="katex-on-dark p-6 bg-[#161b22] rounded-xl flex justify-center">
            <LatexRenderer content={data.formula || ""} className="text-2xl" />
          </div>
          {data.explanation && (
            <div className="prose prose-invert prose-sm">
              <SafeMarkdown>{String(data.explanation ?? "")}</SafeMarkdown>
            </div>
          )}
        </div>
      );

    case "code_snippet":
      return <CodeSnippetViewer data={data} />;

    case "mnemonic":
      return <MnemonicViewer data={data} />;

    default:
      return (
        <div className="p-6 bg-[#161b22] rounded-xl text-slate-400">
          Content type &quot;{type}&quot; preview not implemented yet.
        </div>
      );
  }
}

function McqViewer({
  data,
  onSubmitAnswer,
  isCompleted,
  previousAnswer,
  isCorrect,
}: {
  data: any;
  onSubmitAnswer?: (a: string, correct?: boolean) => void;
  isCompleted?: boolean;
  previousAnswer?: string;
  isCorrect?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(
    previousAnswer ?? null,
  );
  const [submitted, setSubmitted] = useState(!!isCompleted);
  const correctId = data.correct_option;

  const handleSubmit = () => {
    if (!selected || !onSubmitAnswer) return;
    const correct = selected === correctId;
    onSubmitAnswer(selected, correct);
    setSubmitted(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-white font-medium">{data.question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(data.options || []).map((opt: any) => {
          const optId = opt.id;
          const isSelected = selected === optId;
          const showCorrect = submitted && optId === correctId;
          const showWrong = submitted && isSelected && optId !== correctId;
          return (
            <button
              key={optId}
              type="button"
              onClick={() => !submitted && setSelected(optId)}
              disabled={submitted}
              className={cn(
                "p-4 rounded-xl text-left border transition-all",
                showCorrect &&
                  "bg-emerald-500/20 border-emerald-500 text-emerald-200",
                showWrong && "bg-red-500/20 border-red-500 text-red-200",
                !showCorrect &&
                  !showWrong &&
                  isSelected &&
                  "bg-indigo-600 border-indigo-500 text-white",
                !showCorrect &&
                  !showWrong &&
                  !isSelected &&
                  "bg-white/5 border-slate-800 text-slate-300 hover:border-slate-600",
              )}
            >
              <span className="font-bold mr-2">
                {String(optId).toUpperCase()}.
              </span>
              {opt.text}
              {showCorrect && (
                <CheckCircle2 className="inline ml-2" size={18} />
              )}
              {showWrong && <XCircle className="inline ml-2" size={18} />}
            </button>
          );
        })}
      </div>
      {!submitted && selected && onSubmitAnswer && (
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
        >
          Submit
        </button>
      )}
      {submitted && data.explanation && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl prose prose-invert prose-sm max-w-none">
          <p className="text-indigo-200 font-medium mb-1">Explanation</p>
          <SafeMarkdown>{String(data.explanation)}</SafeMarkdown>
        </div>
      )}
    </div>
  );
}

function ShortAnswerViewer({
  data,
  onSubmitAnswer,
  isCompleted,
  previousAnswer,
  isCorrect,
}: {
  data: any;
  onSubmitAnswer?: (a: string, correct?: boolean) => void;
  isCompleted?: boolean;
  previousAnswer?: string;
  isCorrect?: boolean;
}) {
  const [answer, setAnswer] = useState(previousAnswer ?? "");
  const [submitted, setSubmitted] = useState(!!isCompleted);
  const correctAnswer = String(data.correct_answer ?? "").trim();
  const caseSensitive = data.case_sensitive === true;

  const handleSubmit = () => {
    const trimmed = answer.trim();
    if (!trimmed || !onSubmitAnswer) return;
    const correct = caseSensitive
      ? trimmed === correctAnswer
      : trimmed.toLowerCase() === correctAnswer.toLowerCase();
    onSubmitAnswer(trimmed, correct);
    setSubmitted(true);
  };

  return (
    <div className="space-y-4">
      <div className="text-white font-medium prose prose-invert prose-sm max-w-none">
        <SafeMarkdown>{String(data.question ?? "")}</SafeMarkdown>
      </div>
      {!submitted ? (
        <>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className="w-full bg-[#0d1117] border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-500"
            disabled={submitted}
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl"
          >
            Submit
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={20} /> Correct!
              </span>
            ) : (
              <span className="flex items-center gap-2 text-red-400">
                <XCircle size={20} /> Incorrect
              </span>
            )}
          </div>
          <p className="text-slate-400">
            Your answer: <span className="text-white">{previousAnswer}</span>
          </p>
          <p className="text-slate-400">
            Correct answer:{" "}
            <span className="text-emerald-400">{correctAnswer}</span>
          </p>
        </div>
      )}
      {submitted && data.explanation && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl prose prose-invert prose-sm max-w-none">
          <SafeMarkdown>{String(data.explanation)}</SafeMarkdown>
        </div>
      )}
    </div>
  );
}

function TrueFalseViewer({
  data,
  onSubmitAnswer,
  isCompleted,
  previousAnswer,
  isCorrect,
}: {
  data: any;
  onSubmitAnswer?: (a: string, correct?: boolean) => void;
  isCompleted?: boolean;
  previousAnswer?: string;
  isCorrect?: boolean;
}) {
  const [submitted, setSubmitted] = useState(!!isCompleted);
  const correctAnswer = data.correct_answer === true ? "true" : "false";

  const handleChoice = (val: "true" | "false") => {
    if (submitted || !onSubmitAnswer) return;
    const correct = val === correctAnswer;
    onSubmitAnswer(val, correct);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <p className="text-white font-medium text-lg">{data.statement}</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleChoice("true")}
          disabled={submitted}
          className={cn(
            "py-8 px-6 rounded-2xl border-2 font-bold text-xl transition-all",
            submitted &&
              previousAnswer === "true" &&
              isCorrect &&
              "bg-emerald-500/20 border-emerald-500 text-emerald-400",
            submitted &&
              previousAnswer === "true" &&
              !isCorrect &&
              "bg-red-500/20 border-red-500 text-red-400",
            submitted &&
              correctAnswer === "true" &&
              previousAnswer !== "true" &&
              "bg-emerald-500/10 border-emerald-500/50",
            !submitted &&
              "bg-[#161b22] border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10",
          )}
        >
          TRUE
        </button>
        <button
          onClick={() => handleChoice("false")}
          disabled={submitted}
          className={cn(
            "py-8 px-6 rounded-2xl border-2 font-bold text-xl transition-all",
            submitted &&
              previousAnswer === "false" &&
              isCorrect &&
              "bg-emerald-500/20 border-emerald-500 text-emerald-400",
            submitted &&
              previousAnswer === "false" &&
              !isCorrect &&
              "bg-red-500/20 border-red-500 text-red-400",
            submitted &&
              correctAnswer === "false" &&
              previousAnswer !== "false" &&
              "bg-emerald-500/10 border-emerald-500/50",
            !submitted &&
              "bg-[#161b22] border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/10",
          )}
        >
          FALSE
        </button>
      </div>
      {submitted && data.explanation && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl prose prose-invert prose-sm max-w-none">
          <SafeMarkdown>{String(data.explanation)}</SafeMarkdown>
        </div>
      )}
    </div>
  );
}

function FillBlankViewer({
  data,
  onSubmitAnswer,
  isCompleted,
  previousAnswer,
  isCorrect,
}: {
  data: any;
  onSubmitAnswer?: (a: string, correct?: boolean) => void;
  isCompleted?: boolean;
  previousAnswer?: string;
  isCorrect?: boolean;
}) {
  const [fillValue, setFillValue] = useState(previousAnswer ?? "");
  const [submitted, setSubmitted] = useState(!!isCompleted);
  const correctAnswer = String(data.correct_answer ?? "").trim();
  const parts = String(data.sentence ?? "").split("___blank___");

  const handleSubmit = () => {
    const trimmed = fillValue.trim();
    if (!onSubmitAnswer) return;
    const correct = trimmed.toLowerCase() === correctAnswer.toLowerCase();
    onSubmitAnswer(trimmed, correct);
    setSubmitted(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-white">
        {parts.map((p: string, i: number) => (
          <span key={i}>
            {p}
            {i < parts.length - 1 &&
              (submitted ? (
                <span
                  className={cn(
                    "inline-block mx-1 px-2 py-0.5 rounded",
                    isCorrect
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400",
                  )}
                >
                  {previousAnswer}
                </span>
              ) : (
                <input
                  type="text"
                  value={fillValue}
                  onChange={(e) => setFillValue(e.target.value)}
                  placeholder="..."
                  className="inline-block w-32 mx-1 px-2 py-1 bg-[#0d1117] border border-slate-700 rounded text-white"
                />
              ))}
          </span>
        ))}
      </div>
      {data.hint && !submitted && (
        <p className="text-slate-500 text-sm">Hint: {data.hint}</p>
      )}
      {!submitted && onSubmitAnswer && (
        <button
          onClick={handleSubmit}
          disabled={!fillValue.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl"
        >
          Submit
        </button>
      )}
      {submitted && !isCorrect && (
        <p className="text-slate-400">
          Correct answer:{" "}
          <span className="text-emerald-400">{correctAnswer}</span>
        </p>
      )}
    </div>
  );
}

function FlashcardViewer({ data }: { data: any }) {
  const [flipped, setFlipped] = useState(false);
  const front = data.front ?? "";
  const back = data.back ?? "";

  const faceBase: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: "16px",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    overflow: "hidden",
  };

  return (
    <div className="space-y-4">
      <div
        className="w-full max-w-md mx-auto"
        style={{ perspective: "1000px" }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "260px", // explicit height — fixes black card bug
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.5s ease",
            cursor: "pointer",
          }}
          onClick={() => setFlipped(!flipped)}
        >
          {/* Front face */}
          <div
            style={{
              ...faceBase,
              background: "#0e1f14",
              border: "0.5px solid #1a3a22",
            }}
          >
            <div
              className="prose prose-invert prose-sm max-w-none [&>*]:text-white [&>p]:m-0"
              dangerouslySetInnerHTML={{ __html: front }}
            />
          </div>

          {/* Back face */}
          <div
            style={{
              ...faceBase,
              background: "#0b1520",
              border: "0.5px solid #12213a",
              transform: "rotateY(180deg)",
            }}
          >
            <div
              className="prose prose-invert prose-sm max-w-none [&>*]:text-blue-100 [&>p]:m-0"
              dangerouslySetInnerHTML={{ __html: back }}
            />
          </div>
        </div>
      </div>
      <p className="text-center text-slate-500 text-sm">Click or tap to flip</p>
    </div>
  );
}

function MatchFollowingViewer({
  data,
  onSubmitAnswer,
  isCompleted,
  previousAnswer,
  isCorrect,
}: {
  data: any;
  onSubmitAnswer?: (a: string, correct?: boolean) => void;
  isCompleted?: boolean;
  previousAnswer?: string;
  isCorrect?: boolean;
}) {
  const left = data.left || [];
  const right = data.right || [];
  const correctPairs = data.correct_pairs || {};
  const [selections, setSelections] = useState<Record<number, number>>(
    previousAnswer ? JSON.parse(previousAnswer) : {},
  );
  const [submitted, setSubmitted] = useState(!!isCompleted);

  const handleSelect = (leftIdx: number, rightIdx: number) => {
    if (submitted) return;
    setSelections((prev) => ({ ...prev, [leftIdx]: rightIdx }));
  };

  const handleSubmit = () => {
    if (!onSubmitAnswer) return;
    let correct = true;
    left.forEach((leftItem: string, li: number) => {
      const sel = selections[li];
      if (sel === undefined || correctPairs[leftItem] !== right[sel])
        correct = false;
    });
    if (Object.keys(selections).length !== left.length) correct = false;
    onSubmitAnswer(JSON.stringify(selections), correct);
    setSubmitted(true);
  };

  const isPairCorrect = (li: number, ri: number) =>
    correctPairs[left[li]] === right[ri];

  return (
    <div className="space-y-4">
      {data.title && <p className="text-white font-medium">{data.title}</p>}
      <p className="text-slate-500 text-sm">
        Match each left item with the correct right item.
      </p>
      <div className="space-y-4">
        {left.map((leftItem: string, li: number) => (
          <div
            key={li}
            className="flex flex-col sm:flex-row gap-2 items-start sm:items-center"
          >
            <div className="flex-1 p-3 rounded-xl bg-[#161b22] border border-slate-800 text-white shrink-0 min-w-[120px]">
              {leftItem}
            </div>
            <span className="text-slate-600">→</span>
            <div className="flex-1 flex flex-wrap gap-2">
              {right.map((rightItem: string, ri: number) => {
                const isSelected = selections[li] === ri;
                const usedByOther = Object.entries(selections).some(
                  ([k, v]) => Number(k) !== li && v === ri,
                );
                return (
                  <button
                    key={ri}
                    type="button"
                    onClick={() =>
                      !submitted && !usedByOther && handleSelect(li, ri)
                    }
                    disabled={submitted || usedByOther}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-sm transition-all",
                      submitted &&
                        isSelected &&
                        isPairCorrect(li, ri) &&
                        "bg-emerald-500/20 border-emerald-500 text-emerald-400",
                      submitted &&
                        isSelected &&
                        !isPairCorrect(li, ri) &&
                        "bg-red-500/20 border-red-500 text-red-400",
                      submitted &&
                        !isSelected &&
                        correctPairs[leftItem] === rightItem &&
                        "bg-emerald-500/10 border-emerald-500/50",
                      !submitted &&
                        isSelected &&
                        "bg-indigo-600/20 border-indigo-500 text-white",
                      !submitted &&
                        !isSelected &&
                        !usedByOther &&
                        "bg-[#161b22] border-slate-800 text-slate-400 hover:border-slate-600",
                      usedByOther &&
                        !isSelected &&
                        "opacity-40 cursor-not-allowed",
                    )}
                  >
                    {rightItem}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted &&
        onSubmitAnswer &&
        Object.keys(selections).length === left.length && (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
          >
            Submit
          </button>
        )}
    </div>
  );
}

function CodeSnippetViewer({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);
  const code = String(data.code ?? "");
  const lang = String(data.language ?? "plaintext");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <pre className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 overflow-x-auto text-sm text-slate-300 font-mono">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center gap-1"
        >
          <Copy size={16} />
          <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      {data.explanation && (
        <div className="prose prose-invert prose-sm max-w-none">
          <SafeMarkdown>{String(data.explanation)}</SafeMarkdown>
        </div>
      )}
    </div>
  );
}

function MnemonicViewer({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl text-center">
        <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">
          {data.topic}
        </p>
        <p className="text-2xl font-bold text-white">{data.mnemonic}</p>
      </div>
      {data.breakdown && (
        <div className="prose prose-invert prose-sm max-w-none">
          <SafeMarkdown>{String(data.breakdown)}</SafeMarkdown>
        </div>
      )}
    </div>
  );
}
