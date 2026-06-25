import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { spendTokens, addTokens, getUserTokens } from "@/lib/models/user";
import { CREDITS_PER_GENERATION } from "@/lib/polar";

// gpt-image-1 supports square, landscape (3:2) and portrait (2:3). Pick the one
// closest to the uploaded image so the result keeps roughly the same shape.
function pickSize(width: number, height: number): string {
  if (!width || !height) return "1024x1024";
  const ratio = width / height;
  if (ratio > 1.2) return "1536x1024"; // landscape
  if (ratio < 0.83) return "1024x1536"; // portrait
  return "1024x1024"; // square-ish
}

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

    // 4. Spend credits FIRST (atomic). If the user can't afford a generation we
    //    never call OpenAI — the client shows a fixed blurred teaser instead.
    const newBalance = await spendTokens(session.id, CREDITS_PER_GENERATION);
    if (newBalance === null) {
      const tokens = await getUserTokens(session.id);
      return NextResponse.json(
        {
          error: `You need at least ${CREDITS_PER_GENERATION} credits to generate.`,
          insufficientCredits: true,
          tokens,
        },
        { status: 402 }
      );
    }

    // 5. Generate. If anything fails, refund the credits we just spent.
    try {
      // Match the output aspect ratio to the upload, at medium quality.
      const width = Number(form.get("width")) || 0;
      const height = Number(form.get("height")) || 0;

      // Optional extra reference images (e.g. a specific car to match).
      const referenceImages = form
        .getAll("referenceImages")
        .filter((f): f is File => f instanceof File && f.size > 0);

      const openaiForm = new FormData();
      openaiForm.append("model", "gpt-image-1");
      if (referenceImages.length > 0) {
        // gpt-image-1 accepts multiple input images via `image[]`.
        openaiForm.append("image[]", image, image.name || "self.png");
        referenceImages.forEach((ref, i) =>
          openaiForm.append("image[]", ref, ref.name || `ref-${i}.png`)
        );
      } else {
        openaiForm.append("image", image, image.name || "upload.png");
      }
      openaiForm.append("prompt", prompt);
      openaiForm.append("size", pickSize(width, height));
      openaiForm.append("quality", "medium");
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
        throw new Error(message);
      }

      const data = (await openaiRes.json()) as {
        data?: { b64_json?: string; url?: string }[];
      };
      const result = data.data?.[0];
      const imageData = result?.b64_json
        ? `data:image/png;base64,${result.b64_json}`
        : result?.url;

      if (!imageData) throw new Error("No image was returned. Please try again.");

      return NextResponse.json({ image: imageData, unlocked: true, tokens: newBalance });
    } catch (genError) {
      // Refund the credits since the generation didn't succeed.
      const tokens = await addTokens(session.id, CREDITS_PER_GENERATION, "refund");
      return NextResponse.json(
        { error: (genError as Error).message || "Image generation failed.", tokens },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Generate route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating your image." },
      { status: 500 }
    );
  }
}
