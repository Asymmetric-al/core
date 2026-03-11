"use client";

import { getCroppedImg, type CropArea } from "@asym/lib/image-utils";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Scissors,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useReducer, useCallback, useRef } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { toast } from "sonner";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Slider } from "./slider";

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

      if (croppedImage) {
        onCropComplete(croppedImage);
      } else {
        throw new Error("Failed to generate cropped image");
      }
    } catch (e) {
      console.error("Crop error:", e);
      toast.error("Failed to crop image. Please try again.");
    } finally {
      dispatch({ type: "setIsProcessing", isProcessing: false });
      processingRef.current = false;
    }
  }, [
    state.croppedAreaPixels,
    image,
    state.rotation,
    outputFormat,
    quality,
    onCropComplete,
  ]);

  const handleCancel = useCallback(() => {
    if (!state.isProcessing) {
      dispatch({ type: "reset" });
      processingRef.current = false;
      onCancel();
    }
  }, [state.isProcessing, onCancel]);

  const handleMediaLoaded = useCallback(() => {
    dispatch({ type: "setImageError", imageError: false });
  }, []);

  if (state.imageError) {
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

        <div className="p-4 sm:p-6 bg-white border-t border-zinc-100 shrink-0 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <ZoomOut className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <Slider
                value={[state.zoom]}
                min={minZoom}
                max={maxZoom}
                step={0.1}
                onValueChange={([val]) =>
                  val !== undefined && dispatch({ type: "setZoom", zoom: val })
                }
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <RotateCw className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <Slider
                value={[state.rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={([val]) =>
                  val !== undefined &&
                  dispatch({ type: "setRotation", rotation: val })
                }
                className="flex-1"
              />
              <span className="text-[10px] font-bold text-zinc-400 w-8 text-right">
                {state.rotation}°
              </span>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={state.isProcessing}
              className="h-9 sm:h-10 text-[10px] font-black uppercase tracking-widest border-zinc-200 rounded-lg flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={state.isProcessing || !state.croppedAreaPixels}
              className="h-9 sm:h-10 text-[10px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px]"
            >
              {state.isProcessing ? (
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
