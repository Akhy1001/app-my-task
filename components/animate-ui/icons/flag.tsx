'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/components/animate-ui/icons/icon';

type FlagProps = IconProps<keyof typeof animations>;

const animations = {
    default: {
        group: {
            initial: {
                rotate: 0,
            },
            animate: {
                rotate: [0, -10, 10, -5, 5, 0],
                transition: {
                    duration: 0.6,
                    ease: 'easeInOut',
                },
            },
            exit: {
                rotate: 0,
                transition: { duration: 0.2 },
            },
        },
        path: {},
    } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: FlagProps) {
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
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
        </motion.svg>
    );
}

function Flag(props: FlagProps) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    animations,
    Flag,
    Flag as FlagIcon,
    type FlagProps,
    type FlagProps as FlagIconProps,
};
