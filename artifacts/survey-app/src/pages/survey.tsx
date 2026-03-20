import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year or More",
];

const HOBBY_OPTIONS = ["Read", "Run", "Hike", "Bike", "Swim", "Other"];

interface FormState {
  hometown: string;
  state: string;
  yearInCollege: string;
  hobbies: string[];
  otherHobby: string;
}

interface FormErrors {
  hometown?: string;
  state?: string;
  yearInCollege?: string;
  hobbies?: string;
  otherHobby?: string;
}

interface SubmittedData {
  hometown: string;
  state: string;
  yearInCollege: string;
  hobbies: string[];
  otherHobby: string;
}

const initialForm: FormState = {
  hometown: "",
  state: "",
  yearInCollege: "",
  hobbies: [],
  otherHobby: "",
};

export default function Survey() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  const otherInputRef = useRef<HTMLInputElement>(null);
  const hometownRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    hometownRef.current?.focus();
  }, []);

  const otherChecked = form.hobbies.includes("Other");

  useEffect(() => {
    if (otherChecked && otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [otherChecked]);

  function toggleHobby(hobby: string) {
    setForm((prev) => {
      const has = prev.hobbies.includes(hobby);
      const next = has
        ? prev.hobbies.filter((h) => h !== hobby)
        : [...prev.hobbies, hobby];
      const nextForm = { ...prev, hobbies: next };
      if (hobby === "Other" && has) {
        nextForm.otherHobby = "";
      }
      return nextForm;
    });
    setErrors((prev) => ({ ...prev, hobbies: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.hometown.trim()) {
      errs.hometown = "Please enter your hometown.";
    }
    if (!form.state) {
      errs.state = "Please select your state.";
    }
    if (!form.yearInCollege) {
      errs.yearInCollege = "Please select your year in college.";
    }
    if (form.hobbies.length === 0) {
      errs.hobbies = "Please select at least one hobby.";
    }
    if (form.hobbies.includes("Other") && !form.otherHobby.trim()) {
      errs.otherHobby = "Please describe your other hobby.";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorKey = Object.keys(errs)[0];
      const el = document.getElementById(firstErrorKey === "hobbies" ? "hobby-group" : firstErrorKey === "otherHobby" ? "otherHobby" : firstErrorKey);
      el?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      hometown: form.hometown.trim(),
      state: form.state,
      year_in_college: form.yearInCollege,
      hobbies: form.hobbies,
      other_hobby: form.hobbies.includes("Other") ? form.otherHobby.trim() : null,
    };

    const { error } = await supabase.from("hobby_survey_results").insert([payload]);

    setIsSubmitting(false);

    if (error) {
      setSubmitError("Something went wrong while submitting. Please try again.");
      return;
    }

    setSubmittedData({
      hometown: form.hometown.trim(),
      state: form.state,
      yearInCollege: form.yearInCollege,
      hobbies: form.hobbies,
      otherHobby: form.otherHobby.trim(),
    });
    setSubmitted(true);
  }

  if (submitted && submittedData) {
    const displayedHobbies = submittedData.hobbies.map((h) =>
      h === "Other" && submittedData.otherHobby ? submittedData.otherHobby : h
    );

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#1a1a1a]">Undergraduate Hobbies Survey</h1>
          <Link href="/results" className="text-sm font-medium text-[#8A3BDB] hover:underline focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-1 rounded">
            View Results
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div
            className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center"
            role="alert"
            aria-live="polite"
          >
            <div
              className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-5"
              aria-hidden="true"
            >
              <svg
                className="w-7 h-7 text-[#8A3BDB]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Thank you!</h2>
            <p className="text-gray-600 mb-6">Your response has been recorded.</p>
            <div className="text-left bg-gray-50 rounded-lg p-5 mb-6 space-y-3 text-sm">
              <div>
                <span className="font-semibold text-[#1a1a1a]">Hometown:</span>{" "}
                <span className="text-gray-700">{submittedData.hometown}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1a1a1a]">State:</span>{" "}
                <span className="text-gray-700">{submittedData.state}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1a1a1a]">Year in College:</span>{" "}
                <span className="text-gray-700">{submittedData.yearInCollege}</span>
              </div>
              <div>
                <span className="font-semibold text-[#1a1a1a]">Hobbies:</span>{" "}
                <span className="text-gray-700">{displayedHobbies.join(", ")}</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setLocation("/results")}
                className="px-6 py-2.5 rounded-lg bg-[#8A3BDB] text-white font-semibold text-sm hover:bg-[#7a32c5] focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        </main>
        <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
          Survey by Mike Colbert, BAIS:3300 - spring 2026.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1a1a1a]">Undergraduate Hobbies Survey</h1>
        <Link href="/results" className="text-sm font-medium text-[#8A3BDB] hover:underline focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-1 rounded">
          View Results
        </Link>
      </header>

      <main className="flex-1 px-4 py-10">
        <div className="w-full max-w-xl mx-auto">
          <p className="text-gray-600 text-sm mb-8">
            All fields are required. Your responses are anonymous.
          </p>

          {submitError && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              <strong>Error:</strong> {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="mb-8">
              <div className="mb-1">
                <label
                  htmlFor="hometown"
                  className="block text-sm font-semibold text-[#1a1a1a] mb-1"
                >
                  1. What is your hometown?
                </label>
                <input
                  id="hometown"
                  ref={hometownRef}
                  type="text"
                  value={form.hometown}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, hometown: e.target.value }));
                    if (errors.hometown) setErrors((p) => ({ ...p, hometown: undefined }));
                  }}
                  placeholder="e.g. Springfield"
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:border-[#8A3BDB] transition-colors ${errors.hometown ? "border-red-500" : "border-gray-300"}`}
                  aria-describedby={errors.hometown ? "hometown-error" : undefined}
                  aria-invalid={!!errors.hometown}
                  autoComplete="address-level2"
                />
                {errors.hometown && (
                  <p id="hometown-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.hometown}
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className="mb-8">
              <div className="mb-1">
                <label
                  htmlFor="state"
                  className="block text-sm font-semibold text-[#1a1a1a] mb-1"
                >
                  2. What state are you from?
                </label>
                <select
                  id="state"
                  value={form.state}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, state: e.target.value }));
                    if (errors.state) setErrors((p) => ({ ...p, state: undefined }));
                  }}
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:border-[#8A3BDB] transition-colors appearance-none cursor-pointer ${errors.state ? "border-red-500" : "border-gray-300"}`}
                  aria-describedby={errors.state ? "state-error" : undefined}
                  aria-invalid={!!errors.state}
                >
                  <option value="">Select a state…</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p id="state-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.state}
                  </p>
                )}
              </div>
            </fieldset>

            <fieldset className="mb-8">
              <legend className="block text-sm font-semibold text-[#1a1a1a] mb-3">
                3. What year are you in college?
              </legend>
              <div
                id="yearInCollege"
                role="group"
                tabIndex={-1}
                aria-describedby={errors.yearInCollege ? "year-error" : undefined}
                className="space-y-2 outline-none"
              >
                {YEAR_OPTIONS.map((year) => (
                  <label
                    key={year}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="yearInCollege"
                      value={year}
                      checked={form.yearInCollege === year}
                      onChange={() => {
                        setForm((p) => ({ ...p, yearInCollege: year }));
                        if (errors.yearInCollege) setErrors((p) => ({ ...p, yearInCollege: undefined }));
                      }}
                      className="w-4 h-4 accent-[#8A3BDB] cursor-pointer"
                      aria-invalid={!!errors.yearInCollege}
                    />
                    <span className="text-sm text-[#1a1a1a]">{year}</span>
                  </label>
                ))}
              </div>
              {errors.yearInCollege && (
                <p id="year-error" role="alert" className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <span aria-hidden="true">⚠</span> {errors.yearInCollege}
                </p>
              )}
            </fieldset>

            <fieldset className="mb-8">
              <legend className="block text-sm font-semibold text-[#1a1a1a] mb-1">
                4. What hobbies do you do to relax?
              </legend>
              <p className="text-xs text-gray-500 mb-3">Select all that apply.</p>
              <div
                id="hobby-group"
                role="group"
                tabIndex={-1}
                aria-describedby={errors.hobbies ? "hobbies-error" : undefined}
                className="space-y-2 outline-none"
              >
                {HOBBY_OPTIONS.map((hobby) => (
                  <div key={hobby}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        value={hobby}
                        checked={form.hobbies.includes(hobby)}
                        onChange={() => toggleHobby(hobby)}
                        className="w-4 h-4 accent-[#8A3BDB] rounded cursor-pointer"
                        aria-invalid={!!errors.hobbies}
                      />
                      <span className="text-sm text-[#1a1a1a]">{hobby}</span>
                    </label>
                    {hobby === "Other" && otherChecked && (
                      <div className="mt-2 ml-7">
                        <label
                          htmlFor="otherHobby"
                          className="block text-sm font-medium text-[#1a1a1a] mb-1"
                        >
                          Please describe your other hobby:
                        </label>
                        <input
                          id="otherHobby"
                          ref={otherInputRef}
                          type="text"
                          value={form.otherHobby}
                          onChange={(e) => {
                            setForm((p) => ({ ...p, otherHobby: e.target.value }));
                            if (errors.otherHobby) setErrors((p) => ({ ...p, otherHobby: undefined }));
                          }}
                          placeholder="e.g. Pottery"
                          className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:border-[#8A3BDB] transition-colors ${errors.otherHobby ? "border-red-500" : "border-gray-300"}`}
                          aria-describedby={errors.otherHobby ? "otherHobby-error" : undefined}
                          aria-invalid={!!errors.otherHobby}
                        />
                        {errors.otherHobby && (
                          <p id="otherHobby-error" role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                            <span aria-hidden="true">⚠</span> {errors.otherHobby}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {errors.hobbies && (
                <p id="hobbies-error" role="alert" className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <span aria-hidden="true">⚠</span> {errors.hobbies}
                </p>
              )}
            </fieldset>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#8A3BDB] text-white font-semibold text-sm hover:bg-[#7a32c5] focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        Survey by Mike Colbert, BAIS:3300 - spring 2026.
      </footer>
    </div>
  );
}
