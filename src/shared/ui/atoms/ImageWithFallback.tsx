'use client'

import type { ImageProps as NextImageProps } from 'next/image'
import NextImage from 'next/image'
import { type ImgHTMLAttributes, useState } from 'react'

export type ImgProps = {
	src?: string
	alt?: string
	fallback?: string
} & ImgHTMLAttributes<HTMLImageElement>

/**
 * 素の img タグ版。src が空または読み込み失敗時に fallback を表示する。
 */
const Img = ({
	src,
	alt = '',
	fallback = '/fallback.webp',
	...props
}: ImgProps) => {
	const [imgSrc, setImgSrc] = useState<string>(
		src && src.trim() !== '' ? src : fallback,
	)

	const handleError = () => {
		if (imgSrc !== fallback) setImgSrc(fallback)
	}

	return <img src={imgSrc} alt={alt} onError={handleError} {...props} />
}

export type ImageProps = { src: string; fallback?: string } & Omit<
	NextImageProps,
	'src'
>

/**
 * next/image 版。onError 時に fallback に差し替える。
 */
export const Image = ({
	src,
	fallback = '/fallback.webp',
	...props
}: ImageProps) => {
	const [imgSrc, setImgSrc] = useState<string>(
		src && src.trim() !== '' ? src : fallback,
	)

	const handleError = () => {
		if (imgSrc !== fallback) setImgSrc(fallback)
	}

	return <NextImage src={imgSrc} onError={handleError} {...props} />
}

export default Img
