"use client";
import * as Alert from "@radix-ui/react-alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  children,
  pending = false,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <Alert.Root>
      <Alert.Trigger asChild>{children}</Alert.Trigger>
      <Alert.Portal>
        <Alert.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Alert.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-xl">
          <Alert.Title className="text-lg font-semibold">{title}</Alert.Title>
          <Alert.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </Alert.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Alert.Cancel className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Alert.Cancel>
            <Alert.Action asChild>
              <Button
                variant="destructive"
                disabled={pending}
                onClick={onConfirm}
              >
                {pending ? "Working…" : "Confirm"}
              </Button>
            </Alert.Action>
          </div>
        </Alert.Content>
      </Alert.Portal>
    </Alert.Root>
  );
}
