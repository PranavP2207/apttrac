import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function ListSearch({
  value,
  label,
}: {
  value?: string;
  label: string;
}) {
  return (
    <form method="get" className="flex w-full gap-2 sm:w-auto">
      <Input
        name="q"
        defaultValue={value}
        aria-label={label}
        placeholder={label}
        maxLength={100}
        className="sm:w-64"
      />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        aria-label={`Submit ${label.toLowerCase()}`}
      >
        <Search />
      </Button>
    </form>
  );
}
