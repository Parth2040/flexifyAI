import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * POST /api/generate
 * Takes the user's uploaded photo + a text prompt and asks OpenAI's
 * `gpt-image-1` model to generate a new image based on them (the images "edits"
 * endpoint accepts an input image). Returns the result as a base64 data URL.
 *
 * Expects multipart/form-data with fields:
 *   - image: the uploaded photo (File)
 *   - prompt: the scene description (string)
 */
export async function POST(request: Request) {
  // 1. Require an authenticated user.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  // 2. Ensure the API key is configured.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Image generation is not configured yet. Add OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  try {
    // 3. Read and validate the incoming form data.
    const form = await request.formData();
    const image = form.get("image");
    const prompt = (form.get("prompt") as string | null)?.trim();

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "Please upload a photo." }, { status: 400 });
    }
    if (!prompt) {
      return NextResponse.json(
        { error: "Please describe the scene you want." },
        { status: 400 }
      );
    }

    // 4. Forward the photo + prompt to OpenAI's image edits endpoint.
    const openaiForm = new FormData();
    openaiForm.append("model", "gpt-image-1");
    openaiForm.append("image", image, image.name || "upload.png");
    openaiForm.append("prompt", prompt);
    openaiForm.append("size", "1024x1024");
    openaiForm.append("n", "1");

    const openaiRes = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openaiForm,
    });

    if (!openaiRes.ok) {
      const detail = await openaiRes.text();
      console.error("OpenAI image generation failed:", detail);
      let message = "Image generation failed. Please try again.";
      try {
        const parsed = JSON.parse(detail);
        if (parsed?.error?.message) message = parsed.error.message;
      } catch {
        /* keep default message */
      }
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const data = (await openaiRes.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const result = data.data?.[0];

    if (result?.b64_json) {
      return NextResponse.json({
        image: `data:image/png;base64,${result.b64_json}`,
      });
    }
    if (result?.url) {
      return NextResponse.json({ image: result.url });
    }

    return NextResponse.json(
      { error: "No image was returned. Please try again." },
      { status: 502 }
    );
  } catch (error) {
    console.error("Generate route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating your image." },
      { status: 500 }
    );
  }
}
