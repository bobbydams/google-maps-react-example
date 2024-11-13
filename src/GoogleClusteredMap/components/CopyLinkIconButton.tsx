import React, { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { green } from "@mui/material/colors";
import { useSpring, animated } from "@react-spring/web";

const CopyLinkIconButton = ({ link }: { link: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const animationProps = useSpring({
    transform: copied ? "scale(1)" : "scale(0.5)",
    opacity: copied ? 1 : 0,
    padding: 0,
    maxWidth: 24,
    maxHeight: 24,
    config: { tension: 300, friction: 10 },
    onRest: () => {
      if (copied) {
        setTimeout(() => setCopied(false), 1000);
      }
    },
  });

  return (
    <Tooltip title={copied ? "Copied!" : "Copy link"} arrow placement="top">
      <IconButton onClick={handleCopy}>
        {copied ? (
          <animated.span style={animationProps}>
            <CheckCircleIcon style={{ color: green[500] }} />
          </animated.span>
        ) : (
          <LinkIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default CopyLinkIconButton;
