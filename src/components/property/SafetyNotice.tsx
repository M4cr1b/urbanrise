import { AlertCircle } from "lucide-react";

export function SafetyNotice() {
  const tips = [
    "It's safer not to pay ahead for inspections",
    "Ask friends or somebody you trust to accompany you for viewing",
    "Look around the apartment to ensure it meets your expectations",
    "Don't pay beforehand if they won't let you move in immediately",
    "Verify that the account details belong to the right property owner before initiating payment",
  ];

  return (
    <section className="mt-6 rounded-md border border-orange-200 bg-orange-50 p-5">
      <h2 className="mb-4 flex items-center gap-2 font-headline text-headline-md text-orange-900">
        <AlertCircle className="size-5" aria-hidden />
        Safety Tips for Viewing & Payment
      </h2>
      <ul className="space-y-2">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex gap-3 font-data text-data-sm text-orange-900">
            <span className="shrink-0 font-semibold text-orange-700">{idx + 1}.</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
