import React from "react";
import { HostElementType } from "../interfaces/IHostElementType";
import { ITextProps } from "../interfaces/ITextElementProps";

export const Text = React.forwardRef((props: ITextProps, ref) => {
  return React.createElement(HostElementType.TEXT, { ref, ...props });
});
