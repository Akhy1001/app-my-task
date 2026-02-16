'use client';

import * as React from 'react';
import { motion, type Variants } from 'motion/react';

import {
    getVariants,
    useAnimateIconContext,
    IconWrapper,
    type IconProps,
} from '@/components/animate-ui/icons/icon';

type Trash2Props = IconProps<keyof typeof animations>;

const animations = {
    default: {
        lid: {
            initial: {
                rotate: 0,
                originX: "50%",
                originY: "50%",
                y: 0,
            },
            animate: {
                rotate: [-3, 3, -2, 2, 0],
                y: -3,
                transition: {
                    duration: 0.5,
                    ease: 'easeInOut',
                    times: [0, 0.2, 0.4, 0.6, 1]
                },
            },
            exit: {
                rotate: 0,
                y: 0,
                transition: { duration: 0.2 },
            },
        },
        bin: {
            initial: {
                scale: 1,
            },
            animate: {
                scale: 1,
            },
        },
        line1: {},
        line2: {},
    } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: Trash2Props) {
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
            <motion.g
                variants={variants.lid}
                initial="initial"
                animate={controls}
            >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6" />
                <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />
            </motion.g>

            <motion.line
                x1="10" x2="10" y1="11" y2="17"
                variants={variants.line1}
                initial="initial"
                animate={controls}
            />

            <motion.line
                x1="14" x2="14" y1="11" y2="17"
                variants={variants.line2}
                initial="initial"
                animate={controls}
            />
        </motion.svg>
    );
}

function Trash2(props: Trash2Props) {
    return <IconWrapper icon={IconComponent} {...props} />;
}

export {
    animations,
    Trash2,
    Trash2 as Trash2Icon,
    type Trash2Props,
    type Trash2Props as Trash2IconProps,
};
