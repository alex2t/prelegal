"use client";

import { ChangeEvent, useState } from "react";
import {
  ConfidentialityTermKind,
  MndaTermKind,
  NdaFormData,
  Party,
} from "@/lib/nda";

interface NdaFormProps {
  data: NdaFormData;
  onChange: (data: NdaFormData) => void;
}

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500";
const labelClass = "block text-sm font-medium text-slate-700";
const legendClass = "text-base font-semibold text-slate-900";

export default function NdaForm({ data, onChange }: NdaFormProps) {
  function setField<K extends keyof NdaFormData>(key: K, value: NdaFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  function setParty(
    key: "party1" | "party2",
    field: keyof Party,
    value: string,
  ) {
    onChange({ ...data, [key]: { ...data[key], [field]: value } });
  }

  // Years fields are edited as free-text local state so the input can be
  // cleared and retyped (e.g. "1" -> "" -> "15"); the parent's numeric field
  // is only clamped to a valid year count on blur.
  const [mndaYearsText, setMndaYearsText] = useState(String(data.mndaTermYears));
  const [confYearsText, setConfYearsText] = useState(
    String(data.confidentialityTermYears),
  );

  function editYears(
    setText: (value: string) => void,
    key: "mndaTermYears" | "confidentialityTermYears",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const raw = event.target.value;
    setText(raw);
    const parsed = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      setField(key, Math.max(1, Math.round(parsed)));
    }
  }

  function commitYears(
    text: string,
    setText: (value: string) => void,
    key: "mndaTermYears" | "confidentialityTermYears",
  ) {
    const parsed = Math.max(1, Math.round(Number(text)) || 1);
    setText(String(parsed));
    setField(key, parsed);
  }

  return (
    <form className="space-y-8" onSubmit={(event) => event.preventDefault()}>
      {(["party1", "party2"] as const).map((key, index) => (
        <fieldset key={key} className="space-y-3">
          <legend className={legendClass}>Party {index + 1}</legend>
          <div>
            <label className={labelClass} htmlFor={`${key}-company`}>
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              id={`${key}-company`}
              className={fieldClass}
              value={data[key].company}
              onChange={(event) =>
                setParty(key, "company", event.target.value)
              }
              placeholder="Acme, Inc."
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor={`${key}-name`}>
                Signatory name
              </label>
              <input
                id={`${key}-name`}
                className={fieldClass}
                value={data[key].signatoryName}
                onChange={(event) =>
                  setParty(key, "signatoryName", event.target.value)
                }
                placeholder="Jordan Lee"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`${key}-title`}>
                Signatory title
              </label>
              <input
                id={`${key}-title`}
                className={fieldClass}
                value={data[key].title}
                onChange={(event) => setParty(key, "title", event.target.value)}
                placeholder="Chief Executive Officer"
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor={`${key}-address`}>
              Notice address (email or postal)
            </label>
            <input
              id={`${key}-address`}
              className={fieldClass}
              value={data[key].noticeAddress}
              onChange={(event) =>
                setParty(key, "noticeAddress", event.target.value)
              }
              placeholder="legal@acme.com"
            />
          </div>
        </fieldset>
      ))}

      <fieldset className="space-y-3">
        <legend className={legendClass}>Agreement details</legend>
        <div>
          <label className={labelClass} htmlFor="purpose">
            Purpose <span className="text-red-500">*</span>
          </label>
          <textarea
            id="purpose"
            className={fieldClass}
            rows={2}
            value={data.purpose}
            onChange={(event) => setField("purpose", event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="effectiveDate">
            Effective date
          </label>
          <input
            id="effectiveDate"
            type="date"
            className={fieldClass}
            value={data.effectiveDate}
            onChange={(event) => setField("effectiveDate", event.target.value)}
          />
        </div>

        <fieldset>
          <legend className={labelClass}>MNDA term</legend>
          <div className="mt-1 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="mndaTermKind"
                checked={data.mndaTermKind === "fixed"}
                onChange={() =>
                  setField("mndaTermKind", "fixed" as MndaTermKind)
                }
              />
              Expires
              <input
                type="number"
                min={1}
                className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
                value={mndaYearsText}
                onChange={(event) =>
                  editYears(setMndaYearsText, "mndaTermYears", event)
                }
                onBlur={() =>
                  commitYears(mndaYearsText, setMndaYearsText, "mndaTermYears")
                }
                disabled={data.mndaTermKind !== "fixed"}
              />
              year(s) from the effective date
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="mndaTermKind"
                checked={data.mndaTermKind === "untilTerminated"}
                onChange={() =>
                  setField("mndaTermKind", "untilTerminated" as MndaTermKind)
                }
              />
              Continues until terminated
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelClass}>Term of confidentiality</legend>
          <div className="mt-1 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="confidentialityTermKind"
                checked={data.confidentialityTermKind === "fixed"}
                onChange={() =>
                  setField(
                    "confidentialityTermKind",
                    "fixed" as ConfidentialityTermKind,
                  )
                }
              />
              <input
                type="number"
                min={1}
                className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
                value={confYearsText}
                onChange={(event) =>
                  editYears(
                    setConfYearsText,
                    "confidentialityTermYears",
                    event,
                  )
                }
                onBlur={() =>
                  commitYears(
                    confYearsText,
                    setConfYearsText,
                    "confidentialityTermYears",
                  )
                }
                disabled={data.confidentialityTermKind !== "fixed"}
              />
              year(s) from the effective date
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="confidentialityTermKind"
                checked={data.confidentialityTermKind === "perpetual"}
                onChange={() =>
                  setField(
                    "confidentialityTermKind",
                    "perpetual" as ConfidentialityTermKind,
                  )
                }
              />
              In perpetuity
            </label>
          </div>
        </fieldset>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={legendClass}>Governing law &amp; jurisdiction</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="governingLaw">
              Governing law (state) <span className="text-red-500">*</span>
            </label>
            <input
              id="governingLaw"
              className={fieldClass}
              value={data.governingLaw}
              onChange={(event) => setField("governingLaw", event.target.value)}
              placeholder="Delaware"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="jurisdiction">
              Jurisdiction <span className="text-red-500">*</span>
            </label>
            <input
              id="jurisdiction"
              className={fieldClass}
              value={data.jurisdiction}
              onChange={(event) => setField("jurisdiction", event.target.value)}
              placeholder="New Castle County, Delaware"
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="modifications">
            MNDA modifications (optional)
          </label>
          <textarea
            id="modifications"
            className={fieldClass}
            rows={2}
            value={data.modifications}
            onChange={(event) => setField("modifications", event.target.value)}
            placeholder="List any changes to the Standard Terms, or leave blank for none."
          />
        </div>
      </fieldset>
    </form>
  );
}
