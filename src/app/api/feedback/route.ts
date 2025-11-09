import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, name, email } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    // Build the Discord message
    let discordMessage = ``;

    // Add "Message from {name} - {email}" if provided, otherwise "anonymous"
    const fromParts = [];
    if (name) fromParts.push(name);
    if (email) fromParts.push(email);

    if (fromParts.length > 0) {
      discordMessage += `**Message from ${fromParts.join(' - ')}**\n\n`;
    } else {
      discordMessage += `**Message from anonymous**\n\n`;
    }

    discordMessage += `${message}\n\n`;
    discordMessage += `-# *${new Date().toLocaleString()}*`;

    // Send to Discord webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: discordMessage,
        username: "Story40 Feedback",
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending feedback:", error);
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}
