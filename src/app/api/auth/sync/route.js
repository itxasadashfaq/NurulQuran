import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { uid, email, displayName, photoURL } = await request.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields: uid or email" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Upsert user profile
    const user = await User.findOneAndUpdate(
      { uid },
      {
        email,
        displayName,
        photoURL,
        lastLoginAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error in sync route:", error);
    return NextResponse.json(
      { error: "Database synchronization failed", details: error.message },
      { status: 500 }
    );
  }
}
