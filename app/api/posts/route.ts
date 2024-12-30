import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type PostRequestBody = {
  userId: number;
  imageUrl: string;
  caption: string;
  hashtags: string;
};

export async function POST(request: Request) {
  try {
    const body: PostRequestBody = await request.json();

    const { userId, imageUrl, caption, hashtags } = body;

    if (!userId || !imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const post = await prisma.post.create({
      data: {
        userId,
        imageUrl,
        caption,
        hashtags,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Post created successfully',
        data: {
          postId: post.id,
          imageUrl: post.imageUrl,
          caption: post.caption,
          hashtags: post.hashtags,
          createdAt: post.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}