"use client";

import { useState } from "react";
import { FormErrors, FormInput } from "@/components/forms/ValidatedForm";
import { validateForm, type FieldErrors } from "@/lib/form-validation";
import { addBusinessImage } from "@/lib/business-actions";
import { useRouter } from "next/navigation";

import { useAppToast } from "@/components/ui/ToastProvider";
type BusinessImageUploadProps = {
  businessId: string;
};

export default function BusinessImageUpload({
  businessId,
}: BusinessImageUploadProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useAppToast();
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setError("");


    setErrors(current => { const next = { ...current }; delete next.image; return next; });
    if (!file) {
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPreview(null);
      setErrors(current => ({ ...current, image: "Only image files are allowed." }));
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setPreview(null);
      setErrors(current => ({ ...current, image: "Image must be smaller than 5 MB." }));
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  }

  async function handleSubmit(formData: FormData) {
    const next = validateForm("image", formData);
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setError("");


    try {
      const result = await addBusinessImage(businessId, formData);
      setErrors(result?.errors || {});
      if (result?.errors && Object.keys(result.errors).length) return;
      if (result?.error) { setError(result.error); return; }

      if (!result?.success) { setError("Unable to upload image."); return; }
      toast("Image added successfully.");
      setPreview(null);

      router.refresh();
    } catch {
      setError("Unable to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormErrors.Provider value={errors}><form noValidate onSubmit={(event) => { event.preventDefault(); if (!loading) void handleSubmit(new FormData(event.currentTarget)); }} className="mt-4 space-y-4">
      <FormInput
        type="file"
        name="image"
        accept="image/*"
        required
        onChange={handleFileChange}
        className="block w-full rounded-md cursor-pointer border p-2 text-sm"
      />

      {preview && (
        <div>
          <p className="mb-2 text-sm font-medium">Preview</p>

          <img
            src={preview}
            alt="Selected image preview"
            className="h-40 w-40 rounded-lg object-cover border"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add image"}
      </button>



      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form></FormErrors.Provider>
  );
}