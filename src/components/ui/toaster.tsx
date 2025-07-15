"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const renderIcon = (variant?: "default" | "destructive" | "success" | "info") => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-emerald-500" />
      case "destructive":
        return <XCircle className="h-6 w-6 text-destructive" />
      case "info":
        return <Info className="h-6 w-6 text-sky-500" />
      default:
        return null
    }
  }

  return (
    (<ToastProvider>
      {toasts.map(function({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-4">
              {renderIcon(props.variant)}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && 
                  <ToastDescription>{description}</ToastDescription>
                }
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>)
  );
}
