import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

type GoogleAuthRequestBody = {
  authorizationCode: string;
};

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          username: email.split("@")[0],
        },
      });
    }

    const token = jwt.sign(
      {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        role: user?.role,
      },
      SECRET_KEY,
      { expiresIn: "10d" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User successfully authenticated",
        data: { user, token },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing request",
      },
      { status: 500 }
    );
  }
}

export async function googleAuthPOST(request: Request) {
  try {
    const body: GoogleAuthRequestBody = await request.json();
    const { authorizationCode } = body;

    if (!authorizationCode) {
      return NextResponse.json(
        { success: false, message: "Authorization code is required" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process?.env?.GOOGLE_CLIENT_ID,
      process?.env?.GOOGLE_CLIENT_SECRET,
      process?.env?.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(authorizationCode);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const userInfoResponse = await oauth2.userinfo.get();
    const { id: googleId, email, name } = userInfoResponse?.data || {};

    let user = await prisma.user.findFirst({
      where: { googleId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || "",
          username: email?.split("@")[0] || `user_${uuidv4()}`,
          name: name || "Google User",
          googleId: googleId || "",
        },
      });
    } else {
      await prisma.user.updateMany({
        where: { id: user?.id },
        data: { googleId },
      });
    }

    const token = jwt.sign(
      { id: user?.id, email: user?.email, username: user?.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "User authenticated successfully",
        data: {
          userId: user?.id,
          username: user?.username,
          email: user?.email,
          token,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error during Google authentication:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}