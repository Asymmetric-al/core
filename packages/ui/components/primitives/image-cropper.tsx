"use client";

import { getCroppedImg, type CropArea } from "@asym/lib/image-utils";
import {
  AlertCircle,
  Loader2,
  RotateCw,
  Scissors,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useReducer, useRef } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { toast } from "sonner";

import {
  preloadImageSource,
  shouldDisplayCropperPreloadFailure,
} from "./image-cropper-helpers";
import { Button } from "../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../shadcn/dialog";
import { Slider } from "../shadcn/slider";

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

type CropperState = {
  crop: Point;
  zoom: number;
  rotation: number;
  croppedAreaPixels: Area | null;
  isProcessing: boolean;
  imageError: boolean;
};

type CropperAction =
  | { type: "reset" }
  | { type: "setCrop"; crop: Point }
  | { type: "setZoom"; zoom: number }
  | { type: "setRotation"; rotation: number }
  | { type: "setCroppedAreaPixels"; croppedAreaPixels: Area | null }
  | { type: "setIsProcessing"; isProcessing: boolean }
  | { type: "setImageError"; imageError: boolean };

const INITIAL_CROPPER_STATE: CropperState = {
  crop: { x: 0, y: 0 },
  zoom: 1,
  rotation: 0,
  croppedAreaPixels: null,
  isProcessing: false,
  imageError: false,
};

function cropperReducer(
  state: CropperState,
  action: CropperAction,
): CropperState {
  switch (action.type) {
    case "reset":
      return INITIAL_CROPPER_STATE;
    case "setCrop":
      return { ...state, crop: action.crop };
    case "setZoom":
      return { ...state, zoom: action.zoom };
    case "setRotation":
      return { ...state, rotation: action.rotation };
    case "setCroppedAreaPixels":
      return { ...state, croppedAreaPixels: action.croppedAreaPixels };
    case "setIsProcessing":
      return { ...state, isProcessing: action.isProcessing };
    case "setImageError":
      return { ...state, imageError: action.imageError };
    default:
      return state;
  }
}

function firstSliderValue(
  value: number | readonly number[],
): number | undefined {
  return Array.isArray(value) ? value[0] : (value as number);
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
  const [state, dispatch] = useReducer(cropperReducer, INITIAL_CROPPER_STATE);
  const processingRef = useRef(false);
  const cropperHasLoadedRef = useRef(false);
  const loadAttemptRef = useRef(0);

  const onCropChange = useCallback((newCrop: Point) => {
    dispatch({ type: "setCrop", crop: newCrop });
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    dispatch({ type: "setZoom", zoom: newZoom });
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    dispatch({ type: "setCroppedAreaPixels", croppedAreaPixels: pixels });
  }, []);

  const handleSave = useCallback(async () => {
    if (!state.croppedAreaPixels || processingRef.current) return;

    processingRef.current = true;
    dispatch({ type: "setIsProcessing", isProcessing: true });

    try {
      const croppedImage = await getCroppedImg(
        image,
        state.croppedAreaPixels as CropArea,
        state.rotation,
        { horizontal: false, vertical: false },
        { outputFormat, quality },
      );

      if (!croppedImage) {
        throw new Error("Failed to generate cropped image");
      }

      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Crop error:", error);
      toast.error("Failed to crop image. Please try again.");
    } finally {
      dispatch({ type: "setIsProcessing", isProcessing: false });
      processingRef.current = false;
    }
  }, [
    image,
    onCropComplete,
    outputFormat,
    quality,
    state.croppedAreaPixels,
    state.rotation,
  ]);

  const handleCancel = useCallback(() => {
    if (state.isProcessing) return;

    dispatch({ type: "reset" });
    processingRef.current = false;
    onCancel();
  }, [onCancel, state.isProcessing]);

  const handleMediaLoaded = useCallback(() => {
    cropperHasLoadedRef.current = true;
    dispatch({ type: "setImageError", imageError: false });
  }, []);

  useEffect(() => {
    if (!open || !image) {
      return;
    }

    let isActive = true;
    const loadAttempt = loadAttemptRef.current + 1;
    let preloadFailureTimer: ReturnType<typeof setTimeout> | undefined;

    loadAttemptRef.current = loadAttempt;
    cropperHasLoadedRef.current = false;
    dispatch({ type: "setImageError", imageError: false });

    void preloadImageSource(image)
      .then(() => {
        if (isActive) {
          dispatch({ type: "setImageError", imageError: false });
        }
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        preloadFailureTimer = setTimeout(() => {
          if (
            shouldDisplayCropperPreloadFailure({
              cropperHasLoaded: cropperHasLoadedRef.current,
              loadAttempt,
              activeLoadAttempt: loadAttemptRef.current,
            })
          ) {
            dispatch({ type: "setImageError", imageError: true });
          }
        }, 150);
      });

    return () => {
      isActive = false;
      if (preloadFailureTimer) {
        clearTimeout(preloadFailureTimer);
      }
    };
  }, [image, open]);

  if (state.imageError) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
        <DialogContent className="border-border bg-background p-6 sm:max-w-[400px]">
          <DialogHeader className="sr-only">
            <DialogTitle>Image load error</DialogTitle>
            <DialogDescription>
              The selected image could not be loaded for cropping.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-y-4 py-8">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="size-6 text-red-500" />
            </div>

            <p className="text-muted-foreground text-center text-sm">
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
      <DialogContent className="border-border bg-background flex h-[90vh] max-h-[700px] flex-col overflow-hidden p-0 sm:max-w-[600px]">
        <DialogHeader className="border-border/70 shrink-0 border-b p-4 sm:p-6">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight sm:text-xl">
            <Scissors className="text-foreground size-4 sm:h-5 sm:w-5" />
            Crop Image
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Adjust zoom and rotation, then apply the crop to save the image.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-foreground relative min-h-[200px] flex-1 sm:min-h-[300px]">
          <Cropper
            image={image}
            crop={state.crop}
            zoom={state.zoom}
            rotation={state.rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
            onMediaLoaded={handleMediaLoaded}
            classes={{
              containerClassName: "rounded-none",
              mediaClassName: "max-h-full",
            }}
          />
        </div>

        <div className="border-border/70 bg-background shrink-0 space-y-4 border-t p-4 sm:space-y-6 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <ZoomOut className="text-muted-foreground size-4 flex-shrink-0" />
              <Slider
                value={[state.zoom]}
                min={minZoom}
                max={maxZoom}
                step={0.1}
                onValueChange={(value) => {
                  const next = firstSliderValue(value);
                  if (next !== undefined) {
                    dispatch({ type: "setZoom", zoom: next });
                  }
                }}
                className="flex-1"
              />
              <ZoomIn className="text-muted-foreground size-4 flex-shrink-0" />
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <RotateCw className="text-muted-foreground size-4 flex-shrink-0" />
              <Slider
                value={[state.rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(value) => {
                  const next = firstSliderValue(value);
                  if (next !== undefined) {
                    dispatch({ type: "setRotation", rotation: next });
                  }
                }}
                className="flex-1"
              />
              <span className="text-muted-foreground w-8 text-right text-[10px] font-bold">
                {state.rotation}&deg;
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={state.isProcessing}
              className="border-border h-9 flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest sm:h-10 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={state.isProcessing || !state.croppedAreaPixels}
              className="bg-primary text-primary-foreground h-9 min-w-[100px] flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 sm:h-10 sm:min-w-[120px] sm:flex-none"
            >
              {state.isProcessing ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
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
