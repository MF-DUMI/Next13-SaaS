import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
//import { Configuration, OpenAIApi } from "openai";
import { increaseApilimit, checkApiLimit } from "@/lib/api-limit";
import OpenAI from "openai"
import   { ChatCompletionMessage }  from "openai";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI ({
    apiKey: process.env.OPENAI_API_KEY
})

const instructionMessage: ChatCompletionMessage = {
    role: "system",
    content: "You are an expert at generating code. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(
    req: Request
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { messages } = body;

        if (!userId){
            return new NextResponse("Unauthorized", {status:500})
        }

        const freeTrial =await checkApiLimit();
        const isPro = await checkSubscription();

        if (!freeTrial && !isPro){
            return new NextResponse("Free trial has expired",{ status:403})
        }


        // if (!configuration.apiKey){
        //     return new NextResponse("OpenAI API Key not configured", {status:500})
        // }

        if (!messages){
            return new NextResponse("Messages are required", {status:400})
        }
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [instructionMessage, ...messages],
        })

        if (!isPro){
            await increaseApilimit();

        }
        return new NextResponse(JSON.stringify(response.choices[0].message))



        
    } catch (error) {
        console.log("[CODE_ERROR]", error)
        return new NextResponse("internal error", { status: 500})
    }
}