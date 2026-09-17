import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicBusinessWhere } from "@/lib/business-visibility";
import BookingSummary from "@/components/reservation/BookingSummary";
import BookingForm from "@/components/reservation/BookingForm";
import { getBusinessPublicIdFromPath } from "@/lib/business-url";
import { auth } from "@/lib/auth";

type ReservePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    serviceId?: string;
  }>;
};

export default async function ReservePage({
  params,
  searchParams,
}: ReservePageProps) {
  const { id: routeValue } = await params;
  const { serviceId } = await searchParams;

  const session = await auth();

  if (!serviceId) {
    notFound();
  }

  const publicId = getBusinessPublicIdFromPath(routeValue);

  let service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isActive: true,
      business: {
        publicId,
        ...publicBusinessWhere,
      },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
        },
      },
    },
  });

  if (!service) {
    service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true,
        business: {
          id: routeValue,
          ...publicBusinessWhere,
        },
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },
      },
    });
  }

  if (!service) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href={"/businesses/" + routeValue}
        className="inline-flex min-h-11 items-center rounded-lg text-sm text-gray-500 hover:text-gray-900 focus-visible:outline-indigo-500"
      >
        &larr; Back to business
      </Link>
      <section className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Book appointment
        </h1>
        <BookingSummary
          businessName={service.business.name}
          serviceName={service.name}
          duration={service.duration}
          price={service.price}
        />
        <p className="mt-4 break-words text-sm text-gray-500">
          {service.business.address} · {service.business.city.name}
        </p>
        {service.description && (
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-gray-600">
            {service.description}
          </p>
        )}
        {session?.user ? (
          <BookingForm
            businessId={service.business.id}
            serviceId={service.id}
            serviceDuration={service.duration}
          />
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-medium text-gray-900">Sign in to book</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              You need to sign in or create an account before booking this
              appointment.
            </p>

            <Link
              href={`/login?callbackUrl=${encodeURIComponent(
                `/businesses/${routeValue}/reserve?serviceId=${service.id}`,
              )}`}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Sign in to continue
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
