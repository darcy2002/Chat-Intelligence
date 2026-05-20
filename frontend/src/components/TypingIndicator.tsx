export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 w-fit bg-white border border-zinc-200 rounded-2xl rounded-bl-sm shadow-xs">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
