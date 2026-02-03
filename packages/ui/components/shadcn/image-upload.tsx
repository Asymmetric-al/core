"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import Image, { type ImageLoader } from "next/image";
import { Button } from "./button";
import { ImageCropper } from "./image-cropper";
import { toast } from "sonner";
import { createBrowserClient } from "@asym/database/supabase";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@asym/ui/lib/utils";
import {
  uploadToCloudinary,
  isCloudinaryEnabled,
} from "@asym/lib/cloudinary-client";
import {
  validateImageFile,
  loadImageAsDataUrl,
  validateImageLoads,
  getErrorMessage,
  createDownscaledPreview,
  formatFileSize,
} from "@asym/lib/image-utils";

const passthroughImageLoader: ImageLoader = ({ src }) => src;

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  bucket?: string;
  path?: string;
  aspect?: number;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  useBackendProcessing?: boolean;
}

export interface ImageUploadChildProps {
  isUploading: boolean;
  openFilePicker: () => void;
}

async function uploadWithBackendProcessing(
  blob: Blob,
  bucket: string,
  path: string,
  token: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, "image.webp");
  formData.append("bucket", bucket);
  formData.append("path", path);

  const response = await fetch("/api/upload/image", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}

async function uploadDirectToStorage(
  blob: Blob,
  bucket: string,
  path: string,
  userId: string,
  supabase: ReturnType<typeof createBrowserClient>,
): Promise<string> {
  const fileName = `${userId}-${Date.now()}.webp`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  bucket = "profiles",
  path = "avatars",
  aspect = 1,
  className,
  children,
  disabled = false,
  useBackendProcessing = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInProgressRef = useRef(false);

  const openFilePicker = useCallback(() => {
    if (!isUploading && !disabled) {
      fileInputRef.current?.click();
    }
  }, [isUploading, disabled]);

  const processFile = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.message || getErrorMessage(validation.error!));
      return;
    }

    try {
      const dataUrl = await loadImageAsDataUrl(file);
      const loadValidation = await validateImageLoads(dataUrl);
      if (!loadValidation.valid) {
        toast.error(loadValidation.message || "Failed to load image");
        return;
      }

      const previewUrl = await createDownscaledPreview(dataUrl, 2048);

      setSelectedImage(previewUrl);
      setIsCropperOpen(true);

      if (file.size > 5 * 1024 * 1024) {
        toast.info(
          `Large file (${formatFileSize(file.size)}) will be optimized on upload`,
        );
      }
    } catch (error) {
      toast.error("Failed to read the image file");
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        setIsDragging(true);
      }
    },
    [disabled, isUploading],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [disabled, isUploading, processFile],
  );

  const handleCropComplete = useCallback(
    async (croppedBlob: Blob) => {
      if (uploadInProgressRef.current) return;
      uploadInProgressRef.current = true;

      setIsCropperOpen(false);
      setIsUploading(true);
      const supabase = createBrowserClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        let publicUrl: string;

        if (isCloudinaryEnabled) {
          // Upload to Cloudinary
          const cloudinaryData = await uploadToCloudinary(croppedBlob, {
            folder: path,
            purpose: bucket,
          });

          // Save metadata to Supabase
          const metadataResponse = await fetch(
            "/api/upload/cloudinary/metadata",
            {
              method: "POST",
              body: JSON.stringify({
                cloudinaryData,
                options: {
                  purpose: bucket,
                  tenantId: undefined, // Add tenantId here if available in your context
                },
              }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!metadataResponse.ok) {
            console.error("Failed to save asset metadata");
            // We still have the URL, so we can continue, but it's better to log
          }

          publicUrl = cloudinaryData.secure_url;
        } else if (useBackendProcessing) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.access_token) throw new Error("No session token");

          publicUrl = await uploadWithBackendProcessing(
            croppedBlob,
            bucket,
            path,
            session.access_token,
          );
        } else {
          publicUrl = await uploadDirectToStorage(
            croppedBlob,
            bucket,
            path,
            user.id,
            supabase,
          );
        }

        onChange(publicUrl);
        toast.success("Image uploaded successfully");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Failed to upload image");
      } finally {
        setIsUploading(false);
        setSelectedImage(null);
        uploadInProgressRef.current = false;
      }
    },
    [bucket, path, onChange, useBackendProcessing],
  );

  const handleCancel = useCallback(() => {
    setIsCropperOpen(false);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const renderChildren = () => {
    if (!children) return null;

    if (typeof children === "function") {
      return (children as (props: ImageUploadChildProps) => React.ReactNode)({
        isUploading,
        openFilePicker,
      });
    }

    return children;
  };

  const acceptTypes = "image/jpeg,image/png,image/webp,image/gif";

  return (
    <div
      className={cn("relative", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={acceptTypes}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />

      {children ? (
        <div
          onClick={openFilePicker}
          className={cn(
            "cursor-pointer",
            isDragging && "ring-2 ring-zinc-400 ring-offset-2 rounded-lg",
            (disabled || isUploading) && "cursor-not-allowed opacity-50",
          )}
        >
          {renderChildren()}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {value ? (
            <div className="relative group">
              <Image
                src={value}
                alt="Uploaded"
                width={96}
                height={96}
                loader={passthroughImageLoader}
                unoptimized
                className="h-24 w-24 rounded-full object-cover border-2 border-zinc-200"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={openFilePicker}
              disabled={isUploading || disabled}
              className={cn(
                "h-24 w-24 rounded-full border-dashed flex flex-col items-center justify-center gap-2",
                isDragging && "border-zinc-400 bg-zinc-50",
              )}
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-zinc-400" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                    Upload
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          aspect={aspect}
          open={isCropperOpen}
          onCropComplete={handleCropComplete}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
