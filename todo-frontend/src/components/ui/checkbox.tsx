// components/ui/checkbox.tsx
// components/ui/checkbox.tsx
import * as React from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root> {
  className?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof RadixCheckbox.Root>,
  CheckboxProps
>(({ className, checked, ...props }, ref) => {
  const isChecked = checked === true; // indeterminate/undefined を弾いて boolean に

  return (
    <RadixCheckbox.Root
      ref={ref}
      type="button" // ← フォーム内でも誤送信しない
      // グローバル button {} に勝てるように背景/枠を明示
      className={cn(
         "inline-grid place-items-center h-6 w-6 p-0 leading-none", // ← パディング無効・中央寄せ
        "peer h-5 w-5 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked
          ? "!bg-primary !border !border-primary !text-primary-foreground"
          : "!bg-card !border !border-input !text-foreground/80",
        className
      )}
      checked={checked}
      {...props}
    >
      <RadixCheckbox.Indicator className="flex items-center justify-center">
        {/* 見え方が分かりやすいようにアイコンも明示トグル */}
        <Check className={cn("h-3.5 w-3.5 transition-opacity", isChecked ? "opacity-100" : "opacity-0")} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
});
Checkbox.displayName = "Checkbox";

// import * as React from "react";
// import * as RadixCheckbox from "@radix-ui/react-checkbox";
// import { Check } from "lucide-react";

// function cn(...classes: Array<string | undefined | false>) {
//   return classes.filter(Boolean).join(" ");
// }

// export interface CheckboxProps
//   extends React.ComponentPropsWithoutRef<typeof RadixCheckbox.Root> {
//   className?: string;
// }

// export const Checkbox = React.forwardRef<
//   React.ElementRef<typeof RadixCheckbox.Root>,
//   CheckboxProps
// >(({ className, ...props }, ref) => {
//   return (
//     <RadixCheckbox.Root
//       ref={ref}
//       className={cn(
//         "peer h-5 w-5 shrink-0 rounded border border-input",
//           "bg-card border border-input",                     // ← 先にリセット
//         "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
//         "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
//         "disabled:cursor-not-allowed disabled:opacity-50",
//         className
//       )}
//       {...props}
//     >
//       <RadixCheckbox.Indicator
//         className={cn("flex items-center justify-center text-current")}
//       >
//         {/* <Check className="h-3.5 w-3.5" /> */}
//         <Check className="h-3.5 w-3.5 text-primary-foreground" />
//       </RadixCheckbox.Indicator>
//     </RadixCheckbox.Root>
//   );
// });
// Checkbox.displayName = "Checkbox";
