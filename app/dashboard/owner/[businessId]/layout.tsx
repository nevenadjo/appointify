import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function OwnerBusinessLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") redirect("/login");
  const { businessId } = await params;
  const business = await prisma.business.findFirst({
    where: { id: businessId, ownerId: session.user.id },
    select: { isSuspended: true },
  });
  if (!business) redirect("/dashboard/owner");

  return (
    <>
      {business.isSuspended && (
        <div role="alert" className="mx-8 mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <p className="font-semibold">Your business has been suspended.</p>
          <p className="mt-2">
            Your business is hidden from clients and cannot receive online bookings.
            Please contact the administrator at{" "}
            <a href="mailto:admin@appointify.com" className="font-medium underline">admin@appointify.com</a>
            {" "}to resolve the suspension. You can still edit your business details.
          </p>
        </div>
      )}
      {children}
    </>
  );
}
