"use client";

import { useState } from "react";
import Link from "next/link";

type DonationModalProps = {
  stateCode: string;
  utilityId: string;
  ngoId: string;
  ngoName: string;
  onClose: () => void;
};

type PaymentMethod = "pix" | "paypal" | "credit_card" | "debit_card";
type Step = "form" | "confirm" | "processing" | "success" | "error";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "paypal", label: "PayPal" },
  { value: "credit_card", label: "Credit card" },
  { value: "debit_card", label: "Debit card" },
];

// Fixed rate for display only — not a real, live exchange rate.
const ESTIMATED_BRL_PER_KWH = 0.75;

type CreatedDonation = {
  creditsKwh: number;
};

export function DonationModal({ stateCode, utilityId, ngoId, ngoName, onClose }: DonationModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [creditsKwh, setCreditsKwh] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [donation, setDonation] = useState<CreatedDonation | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const kwhValue = Number(creditsKwh);
  const isFormValid = creditsKwh.trim() !== "" && kwhValue > 0;
  const estimatedAmountBrl = isFormValid ? kwhValue * ESTIMATED_BRL_PER_KWH : 0;
  const paymentLabel = PAYMENT_METHODS.find((method) => method.value === paymentMethod)?.label;

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
          paymentMethod,
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
        className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-neutral-900"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {step === "form" && (
          <>
            <h2 className="text-lg font-bold">Donate credits to {ngoName}</h2>

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
                ≈ R$ {estimatedAmountBrl.toFixed(2)} (rough estimate, not a real exchange rate)
              </p>
            )}

            <p className="mt-4 text-sm font-medium">Payment method</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={[
                    "rounded-md border px-3 py-2 text-sm transition",
                    paymentMethod === method.value
                      ? "border-amber-400 bg-amber-50 font-semibold dark:bg-amber-950"
                      : "border-neutral-300 dark:border-neutral-700",
                  ].join(" ")}
                >
                  {method.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-500">
                Cancel
              </button>
              <button
                type="button"
                disabled={!isFormValid}
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
            <h2 className="text-lg font-bold">Confirm donation</h2>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="text-neutral-500">NGO:</span> {ngoName}
              </p>
              <p>
                <span className="text-neutral-500">Credits:</span> {kwhValue} kWh
              </p>
              <p>
                <span className="text-neutral-500">Payment method:</span> {paymentLabel}
              </p>
            </div>
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Simulation only — no real charge will be made.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setStep("form")} className="px-4 py-2 text-sm text-neutral-500">
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950"
              >
                Confirm donation
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="text-sm text-neutral-500">Processing your donation…</p>
          </div>
        )}

        {step === "success" && donation && (
          <>
            <h2 className="text-lg font-bold text-green-700 dark:text-green-400">Donation confirmed!</h2>
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
