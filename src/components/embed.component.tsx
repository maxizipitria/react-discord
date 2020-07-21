import React from "react";
import { IEmbedProps } from "../interfaces/IEmbedElementProps";
import { HostElementType } from "../interfaces/IHostElementType";

export const Embed = React.forwardRef((props: IEmbedProps, ref) => {
  return React.createElement(HostElementType.EMBED, { ref, ...props });
});
