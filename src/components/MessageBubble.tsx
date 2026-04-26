"use client";

type MessageBubbleProps = {
  message: {
    id: string;
    body: string;
    direction: string;
    sentAt: string;
  };
  isOwn: boolean;
};

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.sentAt);
  const timeStr = time.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
          isOwn
            ? "mr-2 bg-blue-500 text-white"
            : "ml-2 bg-neutral-200 text-neutral-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p
          className={`mt-1 text-[10px] ${
            isOwn ? "text-blue-100" : "text-neutral-500"
          }`}
        >
          {timeStr}
        </p>
      </div>
    </div>
  );
}
