"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSearchParams } from "next/navigation";

type SearchResult = {
  users: Array<{ userId: number; username: string }>;
  posts: Array<{ postId: number; caption: string; hashtags: string }>;
};

const SearchPage: React.FC = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [searchQuery, setSearchQuery] = useState<string>(query);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/search`, {
        params: { query: searchQuery },
      });
      if (response?.data?.success) {
        setResults(response?.data?.data);
      }
    } catch (error: any) {
      if (isAxiosError(error)) {
        toast.error(error?.response?.data?.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Search</h1>
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="users">Users</SelectItem>
            <SelectItem value="posts">Posts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-6">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users or hashtags..."
          className="w-full"
        />
        <Button onClick={fetchSearchResults} disabled={loading} className="mt-4">
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      <div className="space-y-6">
        {filter !== "posts" && results?.users?.map((user) => (
          <Card key={user?.userId}>
            <CardHeader>
              <CardTitle>{user?.username}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User ID: {user?.userId}</p>
            </CardContent>
          </Card>
        ))}
        {filter !== "users" && results?.posts?.map((post) => (
          <Card key={post?.postId}>
            <CardHeader>
              <CardTitle>{post?.caption}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Hashtags: {post?.hashtags}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;