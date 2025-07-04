import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Upload, Camera, X, Check, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploadCropProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageUploadCrop({ value, onChange, className }: ImageUploadCropProps) {
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef<string>('');
  const [aspect] = useState<number | undefined>(1); // Square aspect ratio

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Create image URL and show crop dialog
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || '';
      
      imageElement.addEventListener('load', (e) => {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = imageUrl;
      });
      
      imageElement.src = imageUrl;
      setImageSrc(imageUrl);
      setShowCropDialog(true);
    });
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']
    },
    multiple: false
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function generateDownload(canvas: HTMLCanvasElement) {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob');
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          onChange(base64);
          setShowCropDialog(false);
          
          toast({
            title: "Profile picture updated",
            description: "Your profile picture has been cropped and saved successfully",
          });
        };
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.9,
    );
  }

  function onDownloadCropClick() {
    const image = imgRef.current;
    const canvas = hiddenCanvasRef.current;
    
    if (!image || !canvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    // This will size relative to the uploaded image size. If you want to size according to what the user is looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      offscreen.width,
      offscreen.height,
    );

    // Convert OffscreenCanvas to regular canvas for compatibility
    canvas.width = offscreen.width;
    canvas.height = offscreen.height;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
      throw new Error('No 2d context');
    }
    
    canvasCtx.drawImage(offscreen.transferToImageBitmap(), 0, 0);
    generateDownload(canvas);
  }

  const handleRemoveImage = () => {
    onChange('');
    toast({
      title: "Profile picture removed",
      description: "Your profile picture has been removed",
    });
  };

  return (
    <div className={className}>
      {/* Image Preview or Upload Area */}
      <div className="mb-4">
        {value ? (
          <div className="relative group">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-purple-500/50 bg-black/20">
              <img 
                src={value} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-purple-400"
                  {...getRootProps()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-red-400"
                  onClick={handleRemoveImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`w-32 h-32 mx-auto rounded-full border-2 border-dashed border-purple-500/30 bg-black/20 flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-purple-400/50 hover:bg-purple-950/20 ${
              isDragActive ? 'border-purple-400 bg-purple-950/30' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-xs text-gray-400 text-center px-2">
              {isDragActive ? 'Drop image here' : 'Click or drag image'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-black/50 border-purple-500/30 text-purple-300 hover:bg-purple-950/30 font-gaming"
        {...getRootProps()}
      >
        <Upload className="w-4 h-4 mr-2" />
        UPLOAD NEW IMAGE
      </Button>

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl bg-black/95 border border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-purple-300 font-gaming">CROP YOUR PROFILE PICTURE</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Crop Area */}
            <div className="flex justify-center">
              {imageSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-w-full max-h-96"
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxHeight: '400px',
                      maxWidth: '100%'
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Scale:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xs text-gray-500 w-8">{scale}x</span>
              </div>
              
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setRotate(rotate + 90)}
                className="text-purple-400 hover:text-purple-300"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCropDialog(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onDownloadCropClick}
              disabled={!completedCrop?.width || !completedCrop?.height}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Use This Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden canvas for generating cropped image */}
      <canvas
        ref={hiddenCanvasRef}
        style={{
          display: 'none',
        }}
      />
    </div>
  );
}