"use client";
import ValidatedForm, { FormInput, FormSelect, FormTextarea } from "@/components/forms/ValidatedForm";
import FormActions from "@/components/forms/FormActions";
import { submitOwnerForm, getOwnerFormData } from "@/lib/owner-form-actions";
import { createBusiness, updateBusiness } from "@/lib/business-actions";
import CitySearch from "@/components/search/CitySearch";
import PaymentMethodsField from "@/components/owner/PaymentMethodsField";
type OwnerData = Awaited<ReturnType<typeof getOwnerFormData>>;

export default function BusinessForm({ business, categories, cities, modal = false, onSuccess, onCancel, onPendingChange }: { business?: NonNullable<OwnerData["business"]>; categories: NonNullable<OwnerData["categories"]>; cities: NonNullable<OwnerData["cities"]>; onPendingChange?: (pending: boolean) => void; modal?: boolean; onSuccess?: () => void; onCancel?: () => void }) {
const businessId = business?.id;
return (<ValidatedForm kind="business" action={(data) => business ? updateBusiness(business.id, data, false) : createBusiness(data, false)} pageAction={modal ? undefined : submitOwnerForm.bind(null, "business", businessId, undefined)} permalink={business ? `/dashboard/owner/${business.id}/edit` : "/dashboard/owner/create"} onSuccess={onSuccess} onPendingChange={onPendingChange} className="mt-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Business name
          </label>

          <FormInput
            id="name"
            name="name"
            defaultValue={business?.name ?? ""}
            required
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium">
            Category
          </label>

          <FormSelect
            id="categoryId"
            name="categoryId"
            defaultValue={business?.categoryId ?? ""}
            required
            className="mt-1 w-full rounded-md border px-4 py-3"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FormSelect>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>

          <FormTextarea
            id="description"
            name="description"
            defaultValue={business?.description ?? ""}
            rows={4}
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            Address
          </label>

          <FormInput
            id="address"
            name="address"
            defaultValue={business?.address ?? ""}
            required
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="cityId" className="block text-sm font-medium">
            City
          </label>

          <div className="mt-1">
            <CitySearch cities={cities} defaultValue={business?.cityId ?? ""} />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone
          </label>

          <FormInput
            id="phone"
            name="phone"
            type="tel"
            defaultValue={business?.phone ?? ""}
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Business email
          </label>

          <FormInput
            id="email"
            name="email"
            type="email"
            defaultValue={business?.email ?? ""}
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <PaymentMethodsField acceptsCards={business?.acceptsCards} />

        <FormActions onCancel={onCancel} label={business ? "Save changes" : "Create business"} />
      </ValidatedForm>);
}
