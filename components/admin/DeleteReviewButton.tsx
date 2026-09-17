"use client";
import ConfirmAction from "@/components/ui/ConfirmAction";
import { deleteAdminReview } from "@/lib/admin-actions";
export default function DeleteReviewButton({ reviewId }: { reviewId: string }) {
 return <ConfirmAction label={"Delete"} title={"Delete review?"} description={"Delete this review permanently? This action cannot be undone."} destructive={true} successMessage={"Review deleted successfully."} action={() => deleteAdminReview(reviewId)} />;
}
