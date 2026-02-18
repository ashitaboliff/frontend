'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { buildAuthRedirectPath } from '@/domains/auth/utils/authRedirect'
import PublicEnv from '@/shared/lib/env/public'
import { nicomoji } from '@/shared/lib/fonts'
import { getImageUrl } from '@/shared/lib/r2'
import LineButton from '@/shared/ui/atoms/LineButton'

interface Props {
	readonly redirectFrom?: string | null
}

const SigninPage = ({ redirectFrom }: Props) => {
	const router = useRouter()
	const padlockPath = buildAuthRedirectPath('/auth/padlock', {
		from: redirectFrom,
	})

	return (
		<article className="flex flex-col items-center justify-center">
			<div className="card my-6 flex aspect-square max-w-md flex-col items-center justify-center bg-white shadow-lg">
				<figure>
					<Image
						src={getImageUrl('/utils/login.webp')}
						alt="login"
						width={300}
						height={250}
						unoptimized
						className="h-auto w-full object-contain"
					/>
				</figure>
				<section className="flex flex-col items-center justify-center gap-y-2 p-4">
					<h1 className={`text-3xl ${nicomoji.className}`}>利用登録</h1>
					<p className="text-sm">
						あしたぼの部員、およびOB,OGはこちらから利用登録、もしくはログインを行ってください。
					</p>
					<LineButton onClick={() => router.push(padlockPath)}>
						LINEで登録
					</LineButton>
				</section>
			</div>
			<p className="text-center text-error">
				※ 利用登録にはあしたぼの部室パスワードが必要です
			</p>
			<p className="mt-4 text-base-content text-sm">
				登録した場合は、{' '}
				<Link
					href={`${PublicEnv.NEXT_PUBLIC_APP_URL}/terms`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-info hover:underline"
				>
					利用規約
				</Link>{' '}
				と{' '}
				<Link
					href={`${PublicEnv.NEXT_PUBLIC_APP_URL}/privacy`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-info hover:underline"
				>
					プライバシーポリシー
				</Link>{' '}
				に同意したものとみなされます。
			</p>
		</article>
	)
}

export default SigninPage
