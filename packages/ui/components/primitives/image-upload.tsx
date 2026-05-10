"use client";

import { createBrowserClient } from "@asym/database/supabase";
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
import { Loader2, Upload, X } from "lucide-react";
import Image, { type ImageLoader } from "next/image";
import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

import { cn } from "@asym/ui/lib/utils";

import { ImageCropper } from "./image-cropper";
import {
  composeEventHandlers,
  isKeyboardClickKey,
  resolveButtonTriggerType,
} from "./image-upload-helpers";
import { Button } from "../shadcn/button";

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
  triggerAriaLabel?: string;
}

export interface ImageUploadChildProps {
  isUploading: boolean;
  openFilePicker: () => void;
}

type ImageUploadChildrenRenderer = (
  props: ImageUploadChildProps,
) => React.ReactNode;

function resolveImageUploadChildren(
  children: React.ReactNode,
  props: ImageUploadChildProps,
): React.ReactNode {
  if (!children) return null;

  if (typeof children === "function") {
    return (children as ImageUploadChildrenRenderer)(props);
  }

  return children;
}

function ImageUploadCustomTrigger({
  children,
  isInteractive,
  isDragging,
  disabled,
  isUploading,
  openFilePicker,
  triggerAriaLabel,
}: {
  children: React.ReactNode;
  isInteractive: boolean;
  isDragging: boolean;
  disabled: boolean;
  isUploading: boolean;
  openFilePicker: () => void;
  triggerAriaLabel?: string;
}) {
  const content = resolveImageUploadChildren(children, {
    isUploading,
    openFilePicker,
  });
  const sharedClassName = cn(
    "cursor-pointer",
    isDragging && "ring-2 ring-zinc-400 ring-offset-2 rounded-lg",
    (disabled || isUploading) && "cursor-not-allowed opacity-50",
  );
  const isSingleElement = React.isValidElement(content);
  const elementType = isSingleElement ? content.type : null;
  const isButtonLike =
    (typeof elementType === "string" && elementType === "button") ||
    elementType === Button;

  if (isSingleElement) {
    const element = content as React.ReactElement<{
      className?: string;
      onClick?: React.MouseEventHandler;
      onKeyDown?: React.KeyboardEventHandler;
      role?: string;
      tabIndex?: number;
      type?: "button" | "submit" | "reset";
      disabled?: boolean;
      "aria-disabled"?: boolean;
      "aria-label"?: string;
    }>;

    return React.cloneElement(element, {
      onClick: composeEventHandlers(
        element.props.onClick,
        isInteractive
          ? () => {
              openFilePicker();
            }
          : undefined,
      ),
      onKeyDown: isButtonLike
        ? element.props.onKeyDown
        : composeEventHandlers(
            element.props.onKeyDown,
            (e: React.KeyboardEvent) => {
              if (!isInteractive || !isKeyboardClickKey(e.key)) {
                return;
              }

              e.preventDefault();
              openFilePicker();
            },
          ),
      role: isButtonLike
        ? element.props.role
        : (element.props.role ?? "button"),
      tabIndex: isButtonLike
        ? element.props.tabIndex
        : (element.props.tabIndex ?? (isInteractive ? 0 : -1)),
      "aria-disabled": isInteractive ? undefined : true,
      "aria-label": isButtonLike ? undefined : triggerAriaLabel,
      type: isButtonLike
        ? resolveButtonTriggerType(element.props.type)
        : undefined,
      disabled: isButtonLike ? !isInteractive : undefined,
      className: cn(element.props.className, sharedClassName),
    });
  }

  return (
    <button
      type="button"
      onClick={isInteractive ? openFilePicker : undefined}
      disabled={!isInteractive}
      aria-label={triggerAriaLabel}
      className={cn(
        "border-0 bg-transparent p-0 text-inherit",
        sharedClassName,
      )}
    >
      {content}
    </button>
  );
}

function ImageUploadDefaultContent({
  value,
  onRemove,
  isUploading,
  disabled,
  isDragging,
  openFilePicker,
}: {
  value?: string;
  onRemove?: () => void;
  isUploading: boolean;
  disabled: boolean;
  isDragging: boolean;
  openFilePicker: () => void;
}) {
  return (
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
            className="border-border size-24 rounded-full border-2 object-cover"
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
              <X className="size-3" />
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
            "flex size-24 flex-col items-center justify-center gap-2 rounded-full border-dashed",
            isDragging && "border-ring bg-accent",
          )}
        >
          {isUploading ? (
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          ) : (
            <>
              <Upload className="text-muted-foreground size-6" />
              <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Upload
              </span>
            </>
          )}
        </Button>
      )}
    </div>
  );
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
  triggerAriaLabel = "Upload image",
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
    } catch (_error) {
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
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to upload image";
        console.error("Upload error:", error);
        toast.error(message);
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

  const acceptTypes = "image/jpeg,image/png,image/webp,image/gif";
  const isInteractive = !(disabled || isUploading);

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
        <ImageUploadCustomTrigger
          isInteractive={isInteractive}
          isDragging={isDragging}
          disabled={disabled}
          isUploading={isUploading}
          openFilePicker={openFilePicker}
          triggerAriaLabel={triggerAriaLabel}
        >
          {children}
        </ImageUploadCustomTrigger>
      ) : (
        <ImageUploadDefaultContent
          value={value}
          onRemove={onRemove}
          isUploading={isUploading}
          disabled={disabled}
          isDragging={isDragging}
          openFilePicker={openFilePicker}
        />
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
