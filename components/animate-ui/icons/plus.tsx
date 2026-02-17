'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/components/animate-ui/icons/icon';

type PlusProps = IconProps<keyof typeof animations>;

const animations = {
    default: {
        group: {
            initial: {
                rotate: 0,
                scale: 1,
            },
            animate: {
                rotate: 90,
                scale: 1.1,
                transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 15,
                },
            },
            exit: {
                rotate: 0,
                scale: 1,
                transition: { duration: 0.2 },
            },
        },
        line1: {},
        line2: {},
    } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: PlusProps) {
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
            <motion.path
                d="M5 12h14"
                variants={variants.line1}
                initial="initial"
                animate={controls}
            />
            <motion.path
                d="M12 5v14"
                variants={variants.line2}
                initial="initial"
                animate={controls}
            />
        </motion.svg>
    );
}

function Plus(props: PlusProps) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    animations,
    Plus,
    Plus as PlusIcon,
    type PlusProps,
    type PlusProps as PlusIconProps,
};
