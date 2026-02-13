"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface StaggerProps {
    children: ReactNode;
    className?: string;
}

export function Stagger({ children, className = "" }: StaggerProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: { staggerChildren: 0.12 },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
