import { type ClassNameValue, extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge<string, string>({
  extend: {
    theme: {
      spacing: ["min", "sm", "md", "lg"],
    },
  },
});

export function cn(...inputs: ClassNameValue[]) {
  return customTwMerge(inputs);
}
