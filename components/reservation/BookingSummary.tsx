import { formatPrice } from "@/lib/currency";
export type BookingSummaryProps = {
  businessName: string;
  serviceName: string;
  duration: number;
  price: number;
};

export default function BookingSummary({ businessName, serviceName, duration, price }: BookingSummaryProps) {
  return (
    <div className="mt-5 border-b border-gray-100 pb-6">
      <h2 className="break-words text-lg font-semibold">{serviceName}</h2>
      <p className="mt-1 break-words text-sm text-gray-500">{businessName}</p>
      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3 rounded-xl bg-[#E9EAFF]/60 px-4 py-3 text-sm">
        <div className="flex gap-2"><dt className="text-gray-600">Duration:</dt><dd className="font-medium">{duration} min</dd></div>
        <div className="flex gap-2"><dt className="text-gray-600">Price:</dt><dd className="font-medium">{formatPrice(price)}</dd></div>
      </dl>
    </div>
  );
}
