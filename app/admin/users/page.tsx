import { prisma } from "@/lib/prisma";
import UserStatusButton from "@/components/admin/UserStatusButton";
import { Prisma, Role } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { pagination, searchValue, type AdminSearchParams } from "@/lib/admin-list";
import { ListFilters, SelectFilter, ListPagination, activeOptions } from "@/components/admin/AdminList";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = searchValue(params, "q");
  const status = searchValue(params, "status");
  const role = searchValue(params, "role");
  const where: Prisma.UserWhereInput = {
    ...(q && { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ] }),
    ...((status === "active" || status === "inactive") && { isActive: status === "active" }),
    ...(Object.values(Role).includes(role as Role) && { role: role as Role }),
  };
  const total = await prisma.user.count({ where });
  const paging = pagination(params, total);
  const users = await prisma.user.findMany({
    where,
    skip: paging.skip,
    take: paging.take,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Users
        </h1>

        <p className="mt-2 text-gray-500">
          Manage users registered on the platform.
        </p>
      </div>

      <ListFilters path="/admin/users" query={q} placeholder="Name or email">
        <SelectFilter name="role" label="Roles" value={role} options={Object.values(Role).map((value) => ({ value, label: value }))} />
        <SelectFilter name="status" label="Statuses" value={status} options={activeOptions} />
      </ListFilters>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Name
                </th>

                <th className="px-6 py-4 font-semibold">
                  Email
                </th>

                <th className="px-6 py-4 font-semibold">
                  Role
                </th>

                <th className="px-6 py-4 font-semibold">
                  Registered
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50"
                >
                  {/* Name */}
                  <td className="px-6 py-4 font-medium">
                    {user.name || "—"}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-gray-600">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "OWNER"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Registered */}
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString("en-GB")}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <UserStatusButton
                      userId={user.id}
                      isActive={user.isActive}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found.
          </div>
        )}
      </div>
      <ListPagination path="/admin/users" params={params} page={paging.page} pages={paging.pages} total={total} />
    </div>
  );
}
