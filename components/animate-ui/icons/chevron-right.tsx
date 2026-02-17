'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/components/animate-ui/icons/icon';

type ChevronRightProps = IconProps<keyof typeof animations>;

const animations = {
    default: {
        path: {
            initial: {
                x: 0,
                opacity: 1,
            },
            animate: {
                x: [0, 3, 0],
                transition: {
                    duration: 0.4,
                    ease: 'easeInOut',
                    repeat: 1,
                    repeatType: 'reverse'
                },
            },
            exit: {
                x: 0,
                opacity: 1,
                transition: { duration: 0.2 },
            },
        },
    } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ChevronRightProps) {
    const { controls } = useAnimateIconContext();
    const variants = getVariants(animations);

    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <motion.path
                d="m9 18 6-6-6-6"
                variants={variants.path}
                initial="initial"
                animate={controls}
            />
        </motion.svg>
    );
}

function ChevronRight(props: ChevronRightProps) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    animations,
    ChevronRight,
    ChevronRight as ChevronRightIcon,
    type ChevronRightProps,
    type ChevronRightProps as ChevronRightIconProps,
};
