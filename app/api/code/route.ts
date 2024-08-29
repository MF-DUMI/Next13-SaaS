import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApilimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const instructionMessage: OpenAI.Chat.ChatCompletionMessageParam = {
    role: "system",
    content: "You are an expert at generating code. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();

        if (!freeTrial && !isPro) {
            return new NextResponse("Free trial has expired", { status: 403 });
        }

        if (!messages || !Array.isArray(messages)) {
            return new NextResponse("Messages are required and must be an array", { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [instructionMessage, ...messages] as OpenAI.Chat.ChatCompletionMessageParam[]
        });

        if (!isPro) {
            await increaseApilimit();
        }

        return NextResponse.json(response.choices[0].message);
    } catch (error) {
        console.error("[CODE_ERROR]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}