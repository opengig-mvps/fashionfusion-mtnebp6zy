"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { LoaderCircleIcon, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

type PostFormData = {
  caption: string;
  hashtags: string;
  image: File | null;
};

const CreatePostPage: React.FC = () => {
  const { data: session } = useSession();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostFormData>();
  const [image, setImage] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      setImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png",
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const onSubmit = async (data: PostFormData) => {
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", session?.user.id ?? "");
      formData.append("caption", data.caption);
      formData.append("hashtags", data.hashtags);
      formData.append("image", image);

      const response = await api.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        toast.success("Post created successfully!");
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
      <h2 className="text-2xl font-bold mb-6">Upload and Post Photos</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div {...getRootProps()} className={`border-2 border-dashed p-6 rounded-lg ${isDragActive ? "bg-gray-100" : ""}`}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center text-center">
                <ImageIcon className="w-12 h-12 mb-4" />
                <p className="text-sm">Drag & drop an image here, or click to select an image</p>
                {image && <p className="mt-2 text-green-500">{image.name}</p>}
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input {...register("caption", { required: "Caption is required" })} placeholder="Write a caption..." />
              {errors.caption && <p className="text-red-500 text-sm">{errors.caption.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Input {...register("hashtags")} placeholder="Add hashtags..." />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircleIcon className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Post Photo"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreatePostPage;