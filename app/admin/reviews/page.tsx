import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { adminDate, pagination, searchValue, type AdminSearchParams } from "@/lib/admin-list";
import { AdminList, ListFilters, SelectFilter, ListTable, ListPagination } from "@/components/admin/AdminList";
import DeleteReviewButton from "@/components/admin/DeleteReviewButton";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = searchValue(params, "q");
  const rating = searchValue(params, "rating");
  const contains: Prisma.StringFilter = { contains: q, mode: "insensitive" };
  const where: Prisma.ReviewWhereInput = {
    ...(q && { OR: [
      { comment: contains }, { business: { name: contains } },
      { user: { name: contains } }, { user: { email: contains } },
    ] }),
    ...(/^[1-5]$/.test(rating) && { rating: Number(rating) }),
  };
  const total = await prisma.review.count({ where });
  const paging = pagination(params, total);
  const reviews = await prisma.review.findMany({
    where, skip: paging.skip, take: paging.take,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true, rating: true, comment: true, createdAt: true,
      business: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <AdminList title="Reviews" description="Review customer feedback and remove inappropriate reviews.">
      <ListFilters path="/admin/reviews" query={q} placeholder="Comment, business, reviewer or email">
        <SelectFilter name="rating" label="Ratings" value={rating} options={[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `${value} / 5` }))} />
      </ListFilters>
      <ListTable headings={["Business", "Reviewer", "Rating", "Comment", "Created", "Actions"]} empty={reviews.length === 0}>
        {reviews.map((review) => (
          <tr key={review.id}>
            <td className="font-medium">{review.business.name}</td>
            <td><p>{review.user.name || "—"}</p><p className="text-gray-500">{review.user.email}</p></td>
            <td className="whitespace-nowrap"><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">{review.rating} / 5</span></td>
            <td className="min-w-56 max-w-md whitespace-pre-wrap break-words text-gray-600">{review.comment || "No comment."}</td>
            <td className="whitespace-nowrap text-gray-600">{adminDate(review.createdAt)}</td>
            <td><DeleteReviewButton reviewId={review.id} /></td>
          </tr>
        ))}
      </ListTable>
      <ListPagination path="/admin/reviews" params={params} page={paging.page} pages={paging.pages} total={total} />
    </AdminList>
  );
}
