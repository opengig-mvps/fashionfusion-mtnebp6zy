"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Heart, MessageCircle, Send } from "lucide-react";

const FeedPage: React.FC = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const fetchFeed = async (page: number) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/feed?page=${page}`);
      setPosts(res.data.data);
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(page);
  }, [page]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="container px-4 md:px-6 py-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-4 mt-10">
              {posts?.map((post, i) => (
                <Card key={post?.postId}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage src={post?.user?.profilePicture ?? `https://picsum.photos/seed/${i + 10}/200`} alt={`User ${i + 1}`} />
                      <AvatarFallback>U{i + 1}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{post?.user?.username}</p>
                      <p className="text-xs text-muted-foreground">Posted {new Date(post?.createdAt).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <img
                      src={post?.imageUrl}
                      alt={`Post ${i + 1}`}
                      className="w-full h-auto aspect-square object-cover"
                    />
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <Button variant="ghost" size="icon">
                        <Heart className="h-5 w-5" />
                        <span className="sr-only">Like</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-5 w-5" />
                        <span className="sr-only">Comment</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Share</span>
                      </Button>
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">{post?.user?.username}</span> {post?.caption}
                      </p>
                      <p className="text-muted-foreground mt-1">{post?.hashtags}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => setPage(page > 1 ? page - 1 : 1)} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">{page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" onClick={() => setPage(page + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </section>
      </main>
    </div>
  );
};

export default FeedPage;