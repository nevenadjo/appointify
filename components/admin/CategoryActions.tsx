"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ValidatedForm, { FormInput } from "@/components/forms/ValidatedForm";
import ConfirmAction from "@/components/ui/ConfirmAction";
import AdminModal from "./AdminModal";
import { useAppToast } from "@/components/ui/ToastProvider";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/admin-actions";

type Category = {
  id: string;
  name: string;
  icon: string | null;
  businessCount: number;
};

export function AddCategoryButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const setToast = useAppToast();

  async function submit(formData: FormData) {
    setError("");

    setSaving(true);
    try {
      const result = await createCategory({
        name: String(formData.get("name") || ""),
        icon: String(formData.get("icon") || ""),
      });

      if (!result.success) {
        return result;
      }

      setOpen(false);
      setToast("Category created successfully.");
      router.refresh();
      return result;
    } finally { setSaving(false); }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        + Add category
      </button>

      <AdminModal pending={saving}
        open={open}
        title="Add category"
        onClose={() => setOpen(false)}
      >
        <ValidatedForm kind="category" action={submit} className="space-y-5">
          <label className="block text-sm font-medium">
            Name
            <FormInput
              name="name"
              required
              autoFocus
              className="mt-1 block w-full rounded-md border bg-white px-3 py-2 outline-none focus:border-gray-500"
            />
          </label>

          <label className="block text-sm font-medium">
            Icon
            <FormInput
              name="icon"
              placeholder="Optional"
              className="mt-1 block w-full rounded-md border bg-white px-3 py-2 outline-none focus:border-gray-500"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button" disabled={saving}
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add category"}
            </button>
          </div>
        </ValidatedForm>
      </AdminModal>


    </>
  );
}

export function EditCategoryButton({
  category,
}: {
  category: Category;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const setToast = useAppToast();

  async function submit(formData: FormData) {
    setError("");

    setSaving(true);
    try {
      const result = await updateCategory({
        id: category.id,
        name: String(formData.get("name") || ""),
        icon: String(formData.get("icon") || ""),
      });

      if (!result.success) {
        return result;
      }

      setOpen(false);
      setToast("Category updated successfully.");
      router.refresh();
      return result;
    } finally { setSaving(false); }
  }

  

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
        className="cursor-pointer font-medium underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900"
      >
        Edit
      </button>

      <AdminModal pending={saving}
        open={open}
        title="Edit category"
        onClose={() => setOpen(false)}
      >
        <ValidatedForm kind="category" action={submit} className="space-y-5">
          <label className="block text-sm font-medium">
            Name
            <FormInput
              name="name"
              required
              defaultValue={category.name}
              className="mt-1 block w-full rounded-md border bg-white px-3 py-2 outline-none focus:border-gray-500"
            />
          </label>

          <label className="block text-sm font-medium">
            Icon
            <FormInput
              name="icon"
              defaultValue={category.icon || ""}
              placeholder="Optional"
              className="mt-1 block w-full rounded-md border bg-white px-3 py-2 outline-none focus:border-gray-500"
            />
          </label>

          {category.businessCount > 0 && (
            <p className="rounded-lg bg-[#FFF4E1] px-4 py-3 text-sm text-gray-700">
              This category is currently used by{" "}
              {category.businessCount}{" "}
              {category.businessCount === 1
                ? "business"
                : "businesses"}
              .
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <ConfirmAction label="Delete category" title="Delete category?" description="Are you sure you want to delete this category? This action cannot be undone." destructive disabled={saving || category.businessCount > 0} pendingLabel="Deleting..." successMessage="Category deleted successfully." action={() => deleteCategory(category.id)} onSuccess={() => setOpen(false)} />

            <div className="flex gap-3">
              <button
                type="button" disabled={saving}
              onClick={() => setOpen(false)}
                className="cursor-pointer rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </ValidatedForm>
      </AdminModal>


    </>
  );
}