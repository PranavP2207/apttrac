"use client";
import { signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { humanize, initials } from "@/lib/utils";

export function ProfileMenu({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 gap-2 px-1.5 sm:px-2"
          aria-label="Open profile menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-indigo-100 text-xs text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left lg:block">
            <span className="block text-sm">{user.name}</span>
            <span className="block text-xs font-normal text-muted-foreground">
              {humanize(user.role)}
            </span>
          </span>
          <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void signOut({ callbackUrl: "/login" });
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
