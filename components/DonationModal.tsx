"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DonationModalProps = {
  stateCode: string;
  utilityId: string;
  utilityName: string;
  ngoId: string;
  ngoName: string;
  onClose: () => void;
};

type Step = "form" | "requirements" | "confirm" | "processing" | "success" | "error";

// Fixed rate for display only — not a real, live exchange rate. Credits are
// transferred as-is; no money actually changes hands anywhere in this demo.
const ESTIMATED_BRL_PER_KWH = 0.75;

type CreatedDonation = {
  creditsKwh: number;
};

type RequirementsSource = {
  title: string;
  url: string;
};

type Requirements = {
  items: string[];
  sources: RequirementsSource[];
  generated: boolean;
};

export function DonationModal({ stateCode, utilityId, utilityName, ngoId, ngoName, onClose }: DonationModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [creditsKwh, setCreditsKwh] = useState("");
  const [donation, setDonation] = useState<CreatedDonation | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const requirementsLoading = step === "requirements" && !requirements;

  const kwhValue = Number(creditsKwh);
  const isFormValid = creditsKwh.trim() !== "" && kwhValue > 0;
  const estimatedAmountBrl = isFormValid ? kwhValue * ESTIMATED_BRL_PER_KWH : 0;

  useEffect(() => {
    if (step !== "requirements" || requirements) {
      return;
    }

    let cancelled = false;

    fetch("/api/ai/requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilityId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setRequirements(data);
      })
      .catch(() => {
        if (!cancelled) setRequirements({ items: [], sources: [], generated: false });
      });

    return () => {
      cancelled = true;
    };
  }, [step, utilityId, requirements]);

  async function loadBriefing(donatedKwh: number) {
    setBriefingLoading(true);
    try {
      const response = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ngoId, creditsKwh: donatedKwh }),
      });
      const data = await response.json();
      setBriefing(typeof data.text === "string" ? data.text : null);
    } catch {
      setBriefing(null);
    } finally {
      setBriefingLoading(false);
    }
  }

  async function handleConfirm() {
    setStep("processing");
    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateCode,
          utilityId,
          ngoId,
          creditsKwh: kwhValue,
          amountBrl: estimatedAmountBrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Donation request failed");
      }

      const data = await response.json();
      setDonation(data.donation);
      setStep("success");
      void loadBriefing(data.donation.creditsKwh);
    } catch {
      setStep("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 dark:bg-neutral-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {step === "form" && (
          <>
            <h2 className="text-lg font-bold">Donate credits to {ngoName}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Enter how much of your surplus solar energy credit you want to transfer.
            </p>

            <label className="mt-4 block text-sm font-medium">
              Solar credits (kWh)
              <input
                type="number"
                min="0"
                step="0.1"
                value={creditsKwh}
                onChange={(event) => setCreditsKwh(event.target.value)}
                placeholder="e.g. 15"
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            {isFormValid && (
              <p className="mt-1 text-xs text-neutral-500">
                ≈ R$ {estimatedAmountBrl.toFixed(2)} in avoided electricity cost for the family (rough estimate, informational only)
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-500">
                Cancel
              </button>
              <button
                type="button"
                disabled={!isFormValid}
                onClick={() => setStep("requirements")}
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === "requirements" && (
          <>
            <h2 className="text-lg font-bold">What {utilityName} typically requires</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Real energy credit transfers go through the distributor&apos;s own compensation process — it&apos;s not
              a one-click thing. Here&apos;s what that usually involves.
            </p>

            {requirementsLoading && (
              <p className="mt-4 text-sm text-neutral-500">Looking this up…</p>
            )}

            {requirements && !requirementsLoading && (
              <>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                  {requirements.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  {requirements.generated
                    ? "Generated by AI from a live web search — illustrative, not official guidance. Always confirm directly with the utility."
                    : "Couldn't look this up right now, so this is a general ANEEL compensation checklist, not specific to " +
                      utilityName +
                      "."}
                </p>

                {requirements.sources.length > 0 && (
                  <div className="mt-3 text-xs text-neutral-500">
                    Sources:{" "}
                    {requirements.sources.map((source, index) => (
                      <span key={source.url}>
                        {index > 0 && ", "}
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline">
                          {source.title}
                        </a>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setStep("form")} className="px-4 py-2 text-sm text-neutral-500">
                Back
              </button>
              <button
                type="button"
                disabled={requirementsLoading}
                onClick={() => setStep("confirm")}
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <h2 className="text-lg font-bold">Confirm credit transfer</h2>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="text-neutral-500">NGO:</span> {ngoName}
              </p>
              <p>
                <span className="text-neutral-500">Credits to transfer:</span> {kwhValue} kWh
              </p>
            </div>
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              This is a demo — no real utility meter is updated. No money is involved; you&apos;re transferring energy
              credits you already have.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep("requirements")}
                className="px-4 py-2 text-sm text-neutral-500"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950"
              >
                Confirm transfer
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="text-sm text-neutral-500">Transferring your credits…</p>
          </div>
        )}

        {step === "success" && donation && (
          <>
            <h2 className="text-lg font-bold text-green-700 dark:text-green-400">Credits transferred!</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {donation.creditsKwh} kWh donated to {ngoName}.
            </p>
            <div className="mt-4 min-h-12 rounded-md bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
              {briefingLoading ? "Generating impact summary…" : briefing}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-500">
                Close
              </button>
              <Link
                href="/impact"
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950"
              >
                View impact
              </Link>
            </div>
          </>
        )}

        {step === "error" && (
          <>
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Something went wrong</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              We couldn&apos;t process your donation. Please try again.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-500">
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950"
              >
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
