'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/components/animate-ui/icons/icon';

type SendProps = IconProps<keyof typeof animations>;

const animations = {
    default: {
        group: {
            initial: {
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
            },
            animate: {
                x: [0, 10, -10, 0],
                y: [0, -10, 10, 0],
                opacity: [1, 0, 0, 1],
                scale: [1, 0.5, 0.5, 1],
                transition: {
                    duration: 0.8,
                    ease: 'easeInOut',
                    times: [0, 0.4, 0.5, 1]
                },
            },
            exit: {
                x: 0,
                y: 0,
                opacity: 1,
                transition: { duration: 0.2 },
            },
        },
        path: {},
    } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: SendProps) {
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
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </motion.svg>
    );
}

function Send(props: SendProps) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    animations,
    Send,
    Send as SendIcon,
    type SendProps,
    type SendProps as SendIconProps,
};
