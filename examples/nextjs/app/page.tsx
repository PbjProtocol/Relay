"use client";
import { useEffect, useState } from "react";
export default function Page() {
  const [result, setResult] = useState("Loading…");
  useEffect(() => {
    fetch("/api/relay")
      .then((response) => response.json())
      .then((data: unknown) => setResult(JSON.stringify(data, null, 2)))
      .catch(() => setResult("Unable to load projects"));
  }, []);
  return (
    <main>
      <h1>Relay projects</h1>
      <pre>{result}</pre>
    </main>
  );
}
