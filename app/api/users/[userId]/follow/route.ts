import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type FollowRequestBody = {
  targetUserId: string;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = parseInt(params.userId, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 },
      );
    }

    const body: FollowRequestBody = await request.json();
    const targetUserId = parseInt(body.targetUserId, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid target user ID' },
        { status: 400 },
      );
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: userId,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });
    } else {
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId,
        },
      });
    }

    const followingCount = await prisma.follow.count({
      where: {
        followerId: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Follow status updated',
        data: {
          userId,
          followingCount,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Error toggling follow status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}