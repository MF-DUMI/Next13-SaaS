import * as z from "zod";

export const formSchema = z.object({
    prompt: z.string().min(1, {
        message: "Prompt is required",
    }),
    voice: z.string().min(1, {
        message: "Voice selection is required",
    }),
});

export const voiceOptions = [
    { value: "Alice", label: "Alice" },
    { value: "Bill", label: "Bill" },
    { value: "Brian", label: "Brian" },
    { value: "Callum", label: "Callum" },
    { value: "Charlie", label: "Charlie" },
    { value: "Laura", label: "Laura" },
    { value: "Daniel", label: "Daniel" },
];