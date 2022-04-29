import React, { useEffect, useState } from "react"
import { Flex, Text } from "rebass"

type ErrorToastProps = {
  text: string
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ text }) => {
  const [localText, setLocalText] = useState(text)
  useEffect(() => {
    if (text === "") {
      setTimeout(() => setLocalText(""), 500)
    } else {
      setLocalText(text)
    }
  }, [text])

  return (
    <Flex
      style={{
        position: "absolute",
        backgroundColor: "#B64E4B",
        borderRadius: 5,
        opacity: text ? 1 : 0,
        transition: "opacity 0.5s",
        top: 50,
        zIndex: 1000,
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: 12,
          padding: 10,
        }}
      >
        {localText}
      </Text>
    </Flex>
  )
}
