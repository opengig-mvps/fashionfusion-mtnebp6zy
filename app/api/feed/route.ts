import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from "@/lib/authOptions";

export async function GET(request: Request) {
  try {
    const session: any = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const userId: number = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const followedUsers: { followingId: number }[] = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followedUserIds: number[] = followedUsers.map(follow => follow.followingId);

    const posts: any[] = await prisma.post.findMany({
      where: {
        userId: { in: followedUserIds },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        hashtags: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const feedData: any[] = posts.map(post => ({
      postId: post.id,
      imageUrl: post.imageUrl,
      caption: post.caption,
      hashtags: post.hashtags,
      user: {
        userId: post.user.id,
        username: post.user.username,
      },
      createdAt: post.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Feed retrieved successfully',
        data: feedData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}