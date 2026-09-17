"use client";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { toggleUserActive } from "@/lib/admin-actions";
export default function UserStatusButton({ userId, isActive }: { userId: string; isActive: boolean }) {
 return <ConfirmAction label={isActive ? "Deactivate" : "Activate"} title={isActive ? "Deactivate user?" : "Activate user?"} description={isActive ? "Are you sure you want to deactivate this user? They will no longer be able to use their account." : "Are you sure you want to reactivate this user?"} destructive={isActive} successMessage={isActive ? "User deactivated successfully." : "User activated successfully."} action={() => toggleUserActive(userId)} />;
}
