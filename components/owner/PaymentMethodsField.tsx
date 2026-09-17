import { FormInput } from "@/components/forms/ValidatedForm";
export default function PaymentMethodsField({ acceptsCards = false }: { acceptsCards?: boolean }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">Payment methods</legend>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <FormInput
          type="checkbox"
          name="acceptsCards"
          defaultChecked={acceptsCards}
          aria-describedby="payment-methods-help"
          className="h-4 w-4 shrink-0 rounded border-gray-300 accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        />
        This business accepts card payments
      </label>
      <p id="payment-methods-help" className="text-sm text-gray-500">
        Cash is always available as a payment method.
      </p>
    </fieldset>
  );
}
