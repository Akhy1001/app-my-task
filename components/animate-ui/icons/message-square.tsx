'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/components/animate-ui/icons/icon';

type MessageSquareProps = IconProps<keyof typeof animations>;

const animations = {
    default: {
        group: {
            initial: {
                scale: 1,
                y: 0,
            },
            animate: {
                scale: [1, 1.1, 1],
                y: [0, -3, 0],
                transition: {
                    duration: 0.6,
                    ease: 'easeInOut',
                    times: [0, 0.4, 1]
                },
            },
            exit: {
                scale: 1,
                y: 0,
                transition: { duration: 0.2 },
            },
        },
        path: {},
    } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: MessageSquareProps) {
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
            variants={variants.group}
            initial="initial"
            animate={controls}
            {...props}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </motion.svg>
    );
}

function MessageSquare(props: MessageSquareProps) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    animations,
    MessageSquare,
    MessageSquare as MessageSquareIcon,
    type MessageSquareProps,
    type MessageSquareProps as MessageSquareIconProps,
};
