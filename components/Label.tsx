import * as React from "react"
import styles from "./Label.module.css"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`${styles.label} ${className || ''}`}
      {...props}
    />
  )
)

Label.displayName = "Label"

export { Label }