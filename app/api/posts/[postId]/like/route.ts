import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type LikeRequestBody = {
  userId: number;
};

export async function POST(
  request: Request,
  { params }: { params: { postId: string } },
) {
  try {
    const postId = parseInt(params.postId, 10);
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid post ID' },
        { status: 400 },
      );
    }

    const body: LikeRequestBody = await request.json();
    const userId = body.userId;
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 },
      );
    }

    const existingLike = await prisma.like.findFirst({
      where: { postId, userId },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
    } else {
      await prisma.like.create({
        data: { postId, userId },
      });
    }

    const likesCount = await prisma.like.count({
      where: { postId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Post like status updated',
        data: {
          postId,
          likesCount,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error toggling like status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}