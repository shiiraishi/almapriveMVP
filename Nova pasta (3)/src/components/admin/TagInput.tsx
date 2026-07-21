import { useState } from "react";

export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (!t) return;
    if (value.includes(t)) {
      setText("");
      return;
    }
    onChange([...value, t]);
    setText("");
  };
  return (
    <div className="rounded-md border border-white/15 bg-black/40 p-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/15 px-2 py-0.5 text-xs text-[#D4AF37]"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="text-[#D4AF37]/70 hover:text-white"
              aria-label="Remover"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "Adicionar e Enter"}
          className="flex-1 rounded-md bg-black/60 px-2 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-[#D4AF37]"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/5"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}