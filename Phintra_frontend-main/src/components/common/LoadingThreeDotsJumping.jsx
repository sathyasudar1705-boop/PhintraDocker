import React from 'react';
import { motion } from "framer-motion";

export const LoadingThreeDotsJumping = () => {
    const dotVariants = {
        jump: {
            y: -30,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    };

    return (
        <motion.div
            animate="jump"
            transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
            className="loading-dots-container"
        >
            <motion.div className="loading-dot" variants={dotVariants} />
            <motion.div className="loading-dot" variants={dotVariants} />
            <motion.div className="loading-dot" variants={dotVariants} />
            <StyleSheet />
        </motion.div>
    );
};

function StyleSheet() {
    return (
        <style>
            {`
            .loading-dots-container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                min-height: 200px;
                width: 100%;
            }

            .loading-dot {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background-color: var(--color-cyan, #06B6D4);
                will-change: transform;
            }
            `}
        </style>
    );
}

export default LoadingThreeDotsJumping;
