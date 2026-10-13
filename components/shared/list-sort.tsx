"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
export function ListSort({
  label,
  value,
  options,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter(),
    path = usePathname(),
    params = useSearchParams();
  return (
    <Select
      aria-label={label}
      value={value}
      className="w-auto"
      onChange={(event) => {
        const query = new URLSearchParams(params);
        query.set("sort", event.target.value);
        query.delete("page");
        router.push(`${path}?${query}`);
      }}
    >
      {options.map((o) => (
        <option value={o.value} key={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
