"use client"

import React, { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export interface Point {
  x: number
  y: number
}

export interface Area {
  width: number
  height: number
  x: number
  y: number
}

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
  isLoading?: boolean
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous") // needed to avoid CORS issues
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<File> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No 2d context")
  }

  // set canvas size to match the bounding box
  canvas.width = image.width
  canvas.height = image.height

  ctx.translate(image.width / 2, image.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  // extract the cropped image area
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0)

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file) {
        resolve(new File([file], "profile-crop.jpg", { type: "image/jpeg" }))
      } else {
        reject(new Error("Canvas is empty"))
      }
    }, "image/jpeg", 0.95)
  })
}

export function ImageCropperModal({ imageSrc, onCropComplete, onCancel, isLoading }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropChange = (crop: Point) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-md sm:max-w-xl p-0 overflow-hidden bg-card border-border/70 rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">Adjust your photo</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-72 sm:h-96 mt-2 bg-black/50">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
            style={{
              containerStyle: { background: 'transparent' },
              cropAreaStyle: { border: '2px solid white' }
            }}
          />
        </div>

        <div className="py-6 px-8 flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Zoom</span>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.05}
            onValueChange={(val: any) => setZoom(Array.isArray(val) ? val[0] : val)}
            className="flex-1"
          />
        </div>

        <DialogFooter className="px-6 pb-6 pt-0 border-t border-border/50 bg-muted/20">
          <div className="flex justify-end gap-3 w-full mt-4">
            <Button variant="outline" className="rounded-full" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              Save Photo
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
