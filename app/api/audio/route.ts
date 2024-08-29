import { checkApiLimit, increaseApilimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_API_KEY
});

export async function POST(req: Request) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { prompt, voice } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!prompt) {
            return new NextResponse("Message is required", { status: 400 });
        }

        if (!voice) {
            return new NextResponse("Voice selection is required", { status: 400 });
        }

        const freeTrial = await checkApiLimit();
        const isPro = await checkSubscription();
        
        if (!freeTrial && !isPro){
            return new NextResponse("Free trial has expired", { status: 403 });
        }

        const response = await elevenlabs.generate({
            voice: voice,
            model_id: "eleven_turbo_v2",
            voice_settings: { similarity_boost: 0.5, stability: 0.5 },
            text: prompt
        });

        if (!isPro) {
            await increaseApilimit();
        }

        return new Response(response as any, {
            headers: { "Content-Type": "audio/mpeg" }
        });

    } catch (error) {
        console.log("[MUSIC_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}