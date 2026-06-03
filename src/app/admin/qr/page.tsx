"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download, Printer } from "lucide-react"
import { toast } from "sonner"

export default function QRCodePage() {
  const [siteUrl, setSiteUrl] = useState("")
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fallback to window.location.origin if NEXT_PUBLIC_SITE_URL is not set
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    setSiteUrl(url)
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl)
    toast.success("Link copied to clipboard")
  }

  const downloadQR = () => {
    if (!qrRef.current) return
    const svg = qrRef.current.querySelector("svg")
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = "leeds_employee_data_qr.png"
        downloadLink.href = `${pngFile}`
        downloadLink.click()
      }
    }
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const printQR = () => {
    window.print()
  }

  if (!siteUrl) return null

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight">QR Code</h1>
        <p className="text-muted-foreground">Generate and share the QR code for staff members to access the form.</p>
      </div>

      <Card className="max-w-md mx-auto text-center border-2 border-primary/20 print:border-none print:shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Leeds International School</CardTitle>
          <CardDescription className="text-lg text-foreground mt-2 font-medium">
            Employee Data Collection
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-sm text-muted-foreground print:hidden">
            Scan this QR code with your mobile device to open the form.
          </p>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-border" ref={qrRef}>
            <QRCodeSVG 
              value={siteUrl} 
              size={256}
              level={"H"}
              includeMargin={false}
              fgColor={"#3b0764"} // Deep Purple
            />
          </div>

          <div className="text-sm font-medium bg-muted p-2 rounded-md break-all w-full print:hidden">
            {siteUrl}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 print:hidden">
          <Button onClick={copyLink} variant="outline" className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy Form Link
          </Button>
          <div className="flex gap-3 w-full">
            <Button onClick={downloadQR} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Download PNG
            </Button>
            <Button onClick={printQR} variant="secondary" className="w-full">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </CardFooter>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .max-w-md, .max-w-md * {
            visibility: visible;
          }
          .max-w-md {
            position: absolute;
            left: 50%;
            top: 10%;
            transform: translate(-50%, 0);
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
