"use client";

import { formatPrice } from "@/lib/currency";

import { useState } from "react";
import { groupedHours, hoursText, type Hours } from "./BusinessHours";

type BusinessFaqProps = {
  name: string;
  address: string;
  city: string;
  acceptsCards: boolean;
  hours: Hours[];
  average?: string;
  reviewCount: number;
  minimumPrice: number | null;
  maximumPrice: number | null;
};

export default function BusinessFaq({
  name,
  address,
  city,
  acceptsCards,
  hours,
  average,
  reviewCount,
  minimumPrice,
  maximumPrice,
}: BusinessFaqProps) {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const questions: { question: string; answer: string }[] = [];

  if (address && city) {
    questions.push({
      question: `Where is ${name} located?`,
      answer: `${name} is located at ${address}, ${city}.`,
    });
  }

  if (hours.length) {
    questions.push({
      question: `What are the working hours of ${name}?`,
      answer: groupedHours(hours)
        .map(({ label, text }) => {
          const period = label.replace(" – ", " to ");

          if (text === "Closed") {
            return `${name} is closed on ${period}.`;
          }

          if (text === "Not specified" || text === "Hours not specified") {
            return `Opening hours for ${period} are not specified.`;
          }

          return `${name} is open ${period} from ${text.replace(
            " – ",
            " to",
          )}.`;
        })
        .join(" "),
    });
  }

  const sunday = hours.find((hour) => hour.dayOfWeek === 0);

  if (sunday && (!sunday.isOpen || (sunday.startTime && sunday.endTime))) {
    questions.push({
      question: `Is ${name} open on Sunday?`,
      answer: sunday.isOpen
        ? `Sunday opening hours: ${hoursText(sunday)}.`
        : `${name} is closed on Sunday.`,
    });
  }

  if (reviewCount && average) {
    questions.push({
      question: `What experiences have customers had with ${name}?`,
      answer: `${name} has an average rating of ${average} out of 5 based on ${reviewCount} ${
        reviewCount === 1 ? "review" : "reviews"
      }.`,
    });
  }

  if (minimumPrice !== null && maximumPrice !== null) {
    questions.push({
      question: `What are the service prices at ${name}?`,
      answer:
        minimumPrice === maximumPrice
          ? `Active services at ${name} cost ${formatPrice(minimumPrice)}.`
          : `Active services at ${name} range from ${formatPrice(minimumPrice)} to ${formatPrice(maximumPrice)}.`,
    });
  }

  questions.push({
    question: "What payment methods are accepted?",
    answer: acceptsCards
      ? "Cash and card payments are accepted."
      : "Cash payments are accepted.",
  });

  function toggleQuestion(index: number) {
    setOpenQuestion((current) => (current === index ? null : index));
  }

  return (
    <section className="mx-auto mt-14 max-w-4xl" aria-labelledby="faq-title">
      <h2
        id="faq-title"
        className="text-center text-2xl font-semibold tracking-tight"
      >
        Frequently asked questions
      </h2>

      <div className="mt-6 space-y-2">
        {questions.map(({ question, answer }, index) => {
          const isOpen = openQuestion === index;
          const contentId = `faq-answer-${index}`;

          return (
            <div
              key={question}
              className="overflow-hidden border-b border-gray-200"
            >
              <button
                type="button"
                onClick={() => toggleQuestion(index)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <span>{question}</span>

                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <svg
                    aria-hidden="true"
                    className={`h-5 w-5 transition-transform duration-300 ease-in-out ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="m6 9 6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <div
                id={contentId}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`px-5 pb-5 text-sm leading-relaxed text-gray-600 transition-all duration-300 ${
                      isOpen
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-1 opacity-0"
                    }`}
                  >
                    {answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
