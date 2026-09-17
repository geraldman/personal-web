import type { ComponentProps } from "react";

declare module "*.md" {
  const MDXComponent: (props: ComponentProps<"div">) => JSX.Element;
  export default MDXComponent;
}

declare module "*.mdx" {
  const MDXComponent: (props: ComponentProps<"div">) => JSX.Element;
  export default MDXComponent;
}
