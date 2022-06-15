import { useEffect, useState } from "react"

export interface WindowSize {
  width: number | undefined
  height: number | undefined
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  })
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  return windowSize
}

type UseKeyDownArgs = {
  onPaste: (text: string) => void
  copyText?: string
  onBackspace: () => void
}

export const useKeyDown = ({
  onPaste,
  copyText,
  onBackspace,
}: UseKeyDownArgs) => {
  useEffect(() => {
    const handler = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyV") {
        const text = await navigator.clipboard.readText()
        onPaste(text)
        return
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.code === "KeyC" &&
        copyText
      ) {
        navigator.clipboard.writeText(copyText)
      }
      if (event.code === "Backspace") {
        onBackspace()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [copyText, onPaste, onBackspace])
}
