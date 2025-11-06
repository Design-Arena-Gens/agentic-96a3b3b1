"use client";

import { useState } from "react";

export default function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="codeblock">
      <button className="copyBtn" onClick={onCopy}>{copied ? "Copied" : "Copy"}</button>
      <pre><code>{code}</code></pre>
    </div>
  );
}
