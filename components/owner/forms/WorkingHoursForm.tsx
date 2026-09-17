"use client";
import ValidatedForm, { FormInput } from "@/components/forms/ValidatedForm";
import FormActions from "@/components/forms/FormActions";
import { submitOwnerForm, getOwnerFormData } from "@/lib/owner-form-actions";
import { updateWorkingHours } from "@/lib/business-actions";
type OwnerData = Awaited<ReturnType<typeof getOwnerFormData>>;
const days = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 0, name: "Sunday" },
];
export default function WorkingHoursForm({ business, modal = false, onSuccess, onCancel, onPendingChange }: { business: NonNullable<OwnerData["business"]>; onPendingChange?: (pending: boolean) => void; modal?: boolean; onSuccess?: () => void; onCancel?: () => void }) {
const businessId = business.id;
return (<ValidatedForm kind="hours" action={(data) => updateWorkingHours(business.id, data, false)} pageAction={modal ? undefined : submitOwnerForm.bind(null, "hours", businessId, undefined)} permalink={`/dashboard/owner/${business.id}/working-hours`} onSuccess={onSuccess} onPendingChange={onPendingChange} className="@container mt-6 min-w-0">
        <div className="divide-y divide-gray-200">
          {days.map((day) => {
            const workingHour = business.workingHours.find(hour => hour.dayOfWeek === day.id);
            const timeClass = "min-h-11 w-full cursor-pointer min-w-0 max-w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";
            return (
              <div key={day.id} className="grid min-w-0 grid-cols-1 gap-3 py-4 first:pt-0 @min-[32rem]:grid-cols-2 @min-[46rem]:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] @min-[46rem]:gap-5">
                <div className="flex min-w-0 items-center justify-between gap-3 @min-[32rem]:col-span-2 @min-[46rem]:col-span-1 @min-[46rem]:pt-6">
                  <span className="text-sm font-semibold text-gray-900">{day.name}</span>
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <FormInput type="checkbox" name={`isOpen-${day.id}`} defaultChecked={workingHour?.isOpen ?? false} className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-indigo-600" />
                    Open
                  </label>
                </div>
                <div className="min-w-0">
                  <p className="mb-1.5 text-xs font-medium text-gray-500">Working hours</p>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
                    <div className="min-w-0"><FormInput aria-label={day.name + " Opening time"} type="time" name={`startTime-${day.id}`} defaultValue={workingHour?.startTime ?? "09:00"} className={timeClass} /></div>
                    <span aria-hidden="true" className="flex h-11 items-center text-gray-400">&ndash;</span>
                    <div className="min-w-0"><FormInput aria-label={day.name + " Closing time"} type="time" name={`endTime-${day.id}`} defaultValue={workingHour?.endTime ?? "17:00"} className={timeClass} /></div>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="mb-1.5 text-xs text-gray-500">Break</p>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
                    <div className="min-w-0"><FormInput aria-label={day.name + " Break start"} type="time" name={`breakStart-${day.id}`} defaultValue={workingHour?.breakStart ?? ""} className={timeClass} /></div>
                    <span aria-hidden="true" className="flex h-11 items-center text-gray-400">&ndash;</span>
                    <div className="min-w-0"><FormInput aria-label={day.name + " Break end"} type="time" name={`breakEnd-${day.id}`} defaultValue={workingHour?.breakEnd ?? ""} className={timeClass} /></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <FormActions onCancel={onCancel} label={"Save changes"} />
      </ValidatedForm>);
}
