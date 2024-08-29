import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessage } from "openai";
import { increaseApilimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: ChatCompletionMessage = {
  role: "system",
  content: "You are an expert at tailoring resumes to match job descriptions. Analyze the provided resume and job description, then return a modified version of the resume that highlights relevant skills and experiences for the job. Choose the best work experiences, project experiences and skills for the job. Ensure to use the quantification method, Did X which resulted in Y and effected Z",
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const freeTrial =await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro){
        return new NextResponse("Free trial has expired",{ status:403})
    }

    const body = await req.json();
    const { userInfo, jobDescription } = body;

    if (!userInfo || !jobDescription) {
      return new NextResponse("Missing user information or job description", {
        status: 400,
      });
    }

    console.log("Calling OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        instructionMessage,
        {
          role: "user",
          content: `User Information: ${userInfo}\n\nJob Description: ${jobDescription}`,
        },
      ],
    });

    const tailoredResume = response.choices[0].message.content;
    console.log("Tailored resume length:", tailoredResume?.length);
    
    if (!isPro){
      await increaseApilimit();

    }

    return new NextResponse(JSON.stringify({ tailoredResume }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[RESUME_TAILORING_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}