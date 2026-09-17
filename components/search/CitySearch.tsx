"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ClearFieldError, FormValues, useFieldError } from "@/components/forms/ValidatedForm";

type City = {
  id: string;
  name: string;
};

type CitySearchProps = {
  cities: City[];
  defaultValue?: string;
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export default function CitySearch({
  cities,
  defaultValue = "",
}: CitySearchProps) {
  const { error, id, feedback } = useFieldError("cityId");
  const clearFieldError = useContext(ClearFieldError);
  const values = useContext(FormValues);
  defaultValue = values.cityId ?? defaultValue;
  const selectedCity = cities.find((city) => city.id === defaultValue);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(selectedCity?.name || "");
  const [selectedCityId, setSelectedCityId] = useState(defaultValue);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = cities.filter((city) =>
    normalizeText(city.name).includes(normalizeText(query)),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(city: City) {
    clearFieldError("cityId");
    setSelectedCityId(city.id);
    setQuery(city.name);
    setOpen(false);
    setHighlightedIndex(-1);

    if (inputRef.current) {
      inputRef.current.setCustomValidity("");
    }
  }

  function handleChange(value: string) {
    setQuery(value);
    setSelectedCityId("");
    setOpen(true);
    setHighlightedIndex(0);

    if (inputRef.current) {
      inputRef.current.setCustomValidity("Please select a city from the list.");
    }
  }

  function handleInvalid() {
    if (!selectedCityId && inputRef.current) {
      inputRef.current.setCustomValidity("Please select a city from the list.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!open || filteredCities.length === 0) {
      if (e.key === "ArrowDown") {
        setOpen(true);
        setHighlightedIndex(0);
      }

      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setHighlightedIndex((current) =>
        current < filteredCities.length - 1 ? current + 1 : 0,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : filteredCities.length - 1,
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (highlightedIndex >= 0) {
        handleSelect(filteredCities[highlightedIndex]);
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <noscript><style>{`.city-enhanced { display: none !important; }`}</style><select name="cityId" aria-label="City" defaultValue={defaultValue} className="w-full rounded-md border px-4 py-3"><option value="">Select city</option>{cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}</select></noscript>
      <input type="hidden" name="cityId" value={selectedCityId} />

      <input
        id="cityId"
        aria-invalid={!!error}
        aria-describedby={error ? id : undefined}
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          setOpen(true);

          if (filteredCities.length > 0) {
            setHighlightedIndex(0);
          }
        }}
        onKeyDown={handleKeyDown}
        onInvalid={handleInvalid}
        required
        placeholder="Search city..."
        className={`city-enhanced w-full rounded-md border px-4 py-3 ${error ? "border-red-400" : ""}`}
        autoComplete="off"
      />

      {feedback}

      {open && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
          {filteredCities.length > 0 ? (
            filteredCities.map((city, index) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className={`block w-full cursor-pointer px-4 py-2 text-left ${
                  index === highlightedIndex
                    ? "bg-gray-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {city.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No cities found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
