"use client";

import { useState } from "react";
import { DonationModal } from "@/components/DonationModal";

type DonateButtonProps = {
  stateCode: string;
  utilityId: string;
  utilityName: string;
  ngoId: string;
  ngoName: string;
};

export function DonateButton(props: DonateButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-amber-950 transition hover:bg-amber-300"
      >
        Donate credits
      </button>
      {open && <DonationModal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}
