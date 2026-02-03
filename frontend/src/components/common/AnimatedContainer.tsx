import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  animation?: 'fadeIn' | 'slideUp';
}

export const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ className, children, animation = 'fadeIn', ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const animations = {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      },
    };

    const currentAnim = animations[animation];
    const initial = shouldReduceMotion ? undefined : currentAnim.initial;
    const animate = shouldReduceMotion ? undefined : currentAnim.animate;

    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={initial}
        animate={animate}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedContainer.displayName = 'AnimatedContainer';
