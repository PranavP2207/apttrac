import { requirePageUser } from "@/lib/auth/session";
import { AccessRestricted } from "@/components/shared/access-restricted";
export default async function AccessDeniedPage() {
  await requirePageUser();
  return <AccessRestricted />;
}
