"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import { Slider } from "@asym/ui/components/shadcn/slider";
import { getCroppedImg, CropArea } from "@asym/lib/image-utils";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Scissors,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ImageCropperProps {
  image: string;
  aspect?: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  open: boolean;
  minZoom?: number;
  maxZoom?: number;
  outputFormat?: "image/webp" | "image/jpeg" | "image/png";
  quality?: number;
}

export function ImageCropper({
  image,
  aspect = 1,
  onCropComplete,
  onCancel,
  open,
  minZoom = 1,
  maxZoom = 3,
  outputFormat = "image/webp",
  quality = 0.92,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
      setImageError(false);
      processingRef.current = false;
    }
  }, [open, image]);

  const onCropChange = useCallback((newCrop: Point) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels || processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels as CropArea,
        rotation,
        { horizontal: false, vertical: false },
        { outputFormat, quality },
      );

      if (croppedImage) {
        onCropComplete(croppedImage);
      } else {
        throw new Error("Failed to generate cropped image");
      }
    } catch (e) {
      console.error("Crop error:", e);
      toast.error("Failed to crop image. Please try again.");
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [
    croppedAreaPixels,
    image,
    rotation,
    outputFormat,
    quality,
    onCropComplete,
  ]);

  const handleCancel = useCallback(() => {
    if (!isProcessing) {
      onCancel();
    }
  }, [isProcessing, onCancel]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    toast.error("Failed to load image for cropping");
  }, []);

  if (imageError) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
        <DialogContent className="sm:max-w-[400px] p-6 bg-white border-zinc-200">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm text-zinc-600 text-center">
              Failed to load image. Please try a different file.
            </p>
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] max-h-[700px] flex flex-col p-0 overflow-hidden bg-white border-zinc-200">
        <DialogHeader className="p-4 sm:p-6 border-b border-zinc-100 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
            <Scissors className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-900" />
            Crop Image
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 bg-zinc-900 min-h-[200px] sm:min-h-[300px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
            onMediaLoaded={() => setImageError(false)}
            classes={{
              containerClassName: "rounded-none",
              mediaClassName: "max-h-full",
            }}
          />
        </div>

        <div className="p-4 sm:p-6 bg-white border-t border-zinc-100 shrink-0 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <ZoomOut className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <Slider
                value={[zoom]}
                min={minZoom}
                max={maxZoom}
                step={0.1}
                onValueChange={([val]) => val !== undefined && setZoom(val)}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <RotateCw className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={([val]) => val !== undefined && setRotation(val)}
                className="flex-1"
              />
              <span className="text-[10px] font-bold text-zinc-400 w-8 text-right">
                {rotation}°
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
              className="h-9 sm:h-10 text-[10px] font-black uppercase tracking-widest border-zinc-200 rounded-lg flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isProcessing || !croppedAreaPixels}
              className="h-9 sm:h-10 text-[10px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Processing
                </>
              ) : (
                "Apply Crop"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
