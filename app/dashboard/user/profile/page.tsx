"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader } from "lucide-react"; // Import the Loader icon from lucide-react

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  bio: z.string().optional(),
  profilePicture: z.any().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const UserProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      bio: "",
      profilePicture: null,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(
          `/api/users/${session?.user.id}/profile`
        );
        if (response.data.success) {
          setProfileData(response.data.data);
          setValue("username", response.data.data.username);
          setValue("bio", response.data.data.bio);
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const formData = new FormData();
      formData.append("bio", data.bio || "");
      if (data.profilePicture) {
        formData.append("profilePicture", data.profilePicture[0]);
      }

      const response = await api.patch(
        `/api/users/${session?.user.id}/profile`,
        formData
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setProfileData(response.data.data);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message ?? "Something went wrong");
      } else {
        console.error(error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={profileData?.profilePicture || ""}
                  alt="Profile Picture"
                />
                <AvatarFallback>PP</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <Input
                  type="file"
                  {...register("profilePicture")}
                  accept="image/*"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                {...register("username")}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input {...register("bio")} placeholder="Tell us about yourself" />
              {errors.bio && (
                <p className="text-red-500 text-sm">{errors.bio.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserProfilePage;