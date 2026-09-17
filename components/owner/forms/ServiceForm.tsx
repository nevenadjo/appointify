"use client";
import ValidatedForm, { FormInput, FormSelect, FormTextarea } from "@/components/forms/ValidatedForm";
import FormActions from "@/components/forms/FormActions";
import { submitOwnerForm, getOwnerFormData } from "@/lib/owner-form-actions";
import { createService, updateService } from "@/lib/service-actions";
type OwnerData = Awaited<ReturnType<typeof getOwnerFormData>>;

export default function ServiceForm({ businessId, service, modal = false, onSuccess, onCancel, onPendingChange }: { businessId: string; service?: NonNullable<OwnerData["service"]>; onPendingChange?: (pending: boolean) => void; modal?: boolean; onSuccess?: () => void; onCancel?: () => void }) {

return (<ValidatedForm kind="service" action={(data) => service ? updateService(service.id, data, false) : createService(businessId, data, false)} pageAction={modal ? undefined : submitOwnerForm.bind(null, "service", businessId, service?.id)} permalink={service ? `/dashboard/owner/${businessId}/services/${service.id}/edit` : `/dashboard/owner/${businessId}/services/create`} onSuccess={onSuccess} onPendingChange={onPendingChange} className="mt-6 space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium"
          >
            Service name
          </label>

          <FormInput
            id="name"
            name="name"
            defaultValue={service?.name}
            required
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium"
          >
            Description
          </label>

          <FormTextarea
            id="description"
            name="description"
            defaultValue={service?.description ?? ""}
            rows={4}
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium"
          >
            Price (RSD)
          </label>

          <FormInput
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={service?.price}
            required
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium"
          >
            Duration (minutes)
          </label>

          <FormInput
            id="duration"
            name="duration"
            type="number"
            min="1"
            step="1"
            defaultValue={service?.duration}
            required
            className="mt-1 w-full rounded-md border px-4 py-3"
          />
        </div>

        <FormActions onCancel={onCancel} label={service ? "Save changes" : "Create service"} />
      </ValidatedForm>);
}
